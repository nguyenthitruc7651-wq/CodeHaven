import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PRODUCT_CARD_SELECT = `
  id, slug, title, summary, price_cents, compare_at_price_cents, is_free, currency,
  thumbnail_url, technologies, rating, rating_count, sales_count, download_count,
  current_version, flash_deal_ends_at, published_at, updated_at, is_demo,
  category:categories ( id, name, slug ),
  seller:sellers ( id, store_name, slug, is_verified, level )
`;

export type ProductCardRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  is_free: boolean;
  currency: string;
  thumbnail_url: string | null;
  technologies: string[];
  rating: number;
  rating_count: number;
  sales_count: number;
  download_count: number;
  current_version: string;
  flash_deal_ends_at: string | null;
  published_at: string | null;
  updated_at: string;
  is_demo: boolean;
  category: { id: string; name: string; slug: string } | null;
  seller: {
    id: string;
    store_name: string;
    slug: string;
    is_verified: boolean;
    level: string;
  } | null;
};

function base() {
  return supabase.from("products").select(PRODUCT_CARD_SELECT).eq("status", "PUBLISHED");
}

async function run(q: PromiseLike<{ data: unknown; error: { message: string } | null }>) {
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ProductCardRow[];
}

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, icon, description")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  staleTime: 5 * 60 * 1000,
});

export const homeSectionsQuery = queryOptions({
  queryKey: ["home-sections"],
  queryFn: async () => {
    const [trending, bestSellers, newReleases, free, flash, recentlyUpdated, sellers] =
      await Promise.all([
        run(base().order("view_count", { ascending: false }).limit(8)),
        run(base().order("sales_count", { ascending: false }).limit(8)),
        run(base().order("published_at", { ascending: false }).limit(8)),
        run(base().eq("is_free", true).limit(8)),
        run(
          base()
            .not("flash_deal_ends_at", "is", null)
            .gt("flash_deal_ends_at", new Date().toISOString())
            .limit(8),
        ),
        run(base().order("updated_at", { ascending: false }).limit(8)),
        (async () => {
          const { data, error } = await supabase
            .from("sellers")
            .select(
              "id, store_name, slug, tagline, level, is_verified, badges, total_sales, rating, rating_count, banner_url",
            )
            .order("total_sales", { ascending: false })
            .limit(4);
          if (error) throw new Error(error.message);
          return data ?? [];
        })(),
      ]);
    return { trending, bestSellers, newReleases, free, flash, recentlyUpdated, sellers };
  },
  staleTime: 60 * 1000,
});

export type ExploreFilters = {
  q?: string;
  category?: string;
  tech?: string;
  price?: "all" | "free" | "paid";
  minRating?: number;
  sort?: "relevance" | "newest" | "sales" | "rating" | "price_asc" | "price_desc";
  page?: number;
};

export const PAGE_SIZE = 12;

export function exploreQuery(filters: ExploreFilters) {
  return queryOptions({
    queryKey: ["explore", filters],
    queryFn: async () => {
      const page = filters.page ?? 1;
      let q = supabase
        .from("products")
        .select(PRODUCT_CARD_SELECT, { count: "exact" })
        .eq("status", "PUBLISHED");

      if (filters.q) {
        const term = `%${filters.q}%`;
        q = q.or(`title.ilike.${term},summary.ilike.${term},description.ilike.${term}`);
      }
      if (filters.category && filters.category !== "all") {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", filters.category)
          .maybeSingle();
        q = q.eq("category_id", cat?.id ?? "00000000-0000-0000-0000-000000000000");
      }
      if (filters.tech && filters.tech !== "all") q = q.contains("technologies", [filters.tech]);
      if (filters.price === "free") q = q.eq("is_free", true);
      if (filters.price === "paid") q = q.eq("is_free", false);
      if (filters.minRating) q = q.gte("rating", filters.minRating);

      switch (filters.sort) {
        case "newest":
          q = q.order("published_at", { ascending: false });
          break;
        case "rating":
          q = q.order("rating", { ascending: false });
          break;
        case "price_asc":
          q = q.order("price_cents", { ascending: true });
          break;
        case "price_desc":
          q = q.order("price_cents", { ascending: false });
          break;
        case "sales":
        default:
          q = q.order("sales_count", { ascending: false });
      }

      const from = (page - 1) * PAGE_SIZE;
      const { data, error, count } = await q.range(from, from + PAGE_SIZE - 1);
      if (error) throw new Error(error.message);
      return {
        items: (data ?? []) as unknown as ProductCardRow[],
        total: count ?? 0,
        page,
        pageCount: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
      };
    },
    staleTime: 30 * 1000,
  });
}

export function productQuery(slug: string) {
  return queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          `*, category:categories ( id, name, slug ),
           seller:sellers ( id, store_name, slug, tagline, bio, level, is_verified, badges, total_sales, rating, rating_count, created_at ),
           versions:product_versions ( id, version, changelog, is_current, released_at, file_size_bytes ),
           product_tags ( tag:tags ( id, name, slug ) )`,
        )
        .eq("slug", slug)
        .eq("status", "PUBLISHED")
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function productReviewsQuery(productId: string | undefined) {
  return queryOptions({
    queryKey: 
