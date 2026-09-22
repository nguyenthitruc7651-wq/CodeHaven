import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { categoriesQuery, exploreQuery, type ExploreFilters } from "@/lib/catalog";
import { ProductCard, ProductCardSkeleton } from "@/components/site/ProductCard";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileNav } from "@/components/site/MobileNav";

type SearchParams = {
  q?: string;
  category?: string;
  tech?: string;
  price?: "all" | "free" | "paid";
  minRating?: number;
  sort?: ExploreFilters["sort"];
  page?: number;
};

const TECHS = [
  "Luau",
  "Roblox Studio",
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Python",
  "Tailwind CSS",
  "C++",
  "C#",
];

const SORTS: { value: NonNullable<ExploreFilters["sort"]>; label: string }[] = [
  { value: "sales", label: "Bán chạy nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "rating", label: "Đánh giá cao" },
  { value: "price_asc", label: "Giá: Thấp đến cao" },
  { value: "price_desc", label: "Giá: Cao đến thấp" },
];

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search["q"] === "string" && search["q"] ? search["q"] : undefined,
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    tech: typeof search["tech"] === "string" ? search["tech"] : undefined,
    price: ["free", "paid", "all"].includes(String(search["price"]))
      ? (search["price"] as SearchParams["price"])
      : undefined,
    minRating: Number(search["minRating"]) > 0 ? Number(search["minRating"]) : undefined,
    sort: SORTS.some((s) => s.value === search["sort"])
      ? (search["sort"] as SearchParams["sort"])
      : undefined,
    page: Number(search["page"]) > 1 ? Number(search["page"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Khám phá mã nguồn & script — CodeStore" },
      {
        name: "description",
        content:
          "Tìm kiếm và lọc mã nguồn, Roblox Luau script, template web, dự án Python theo danh mục, ngôn ngữ, giá cả và đánh giá.",
      },
      { property: "og:title", content: "Khám phá mã nguồn & script — CodeStore" },
      {
        property: "og:description",
        content: "Tìm kiếm toàn bộ kho source code chất lượng cao trên CodeStore.",
      },
    ],
  }),
  component: Explore,
});

function Explore() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/explore" });
  const { data: categories } = useQuery(categoriesQuery);
  const [term, setTerm] = useState(search.q ?? "");

  // Tự động cập nhật từ khóa tìm kiếm lên URL sau 350ms
  useEffect(() => {
    const id = setTimeout(() => {
      if ((search.q ?? "") !== term) {
        navigate({ search: (prev) => ({ ...prev, q: term || undefined, page: undefined }) });
      }
    }, 350);
    return () => clearTimeout(id);
  }, [term]);

  const filters: ExploreFilters = {
    q: search.q,
    category: search.category,
    tech: search.tech,
    price: search.price ?? "all",
    minRating: search.minRating,
    sort: search.sort ?? "sales",
    page: search.page ?? 1,
  };
  const { data, isPending, isError, error } = useQuery(exploreQuery(filters));

  const set = (patch: Partial<SearchParams>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch, page: undefined }) });

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
      <Header />

      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 w-full">
        <h1 className="text-2xl font-bold sm:text-3xl font-display">Kho mã nguồn</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data ? `Tìm thấy ${data.total} sản phẩm phù hợp` : "Đang tìm kiếm trong kho..."}
        </p>

        {/* Ô tìm kiếm */}
        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Tìm theo tên mã nguồn, mô tả, ngôn ngữ..."
            className="h-12 w-full rounded-2xl border border-border bg-surface pl-11 pr-4 text-sm outline-hidden focus:border-primary/50 focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Thanh chọn bộ lọc */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <SlidersHorizontal className="size-3.5" /> Bộ lọc:
          </span>
          <select
            value={search.category ?? "all"}
            onChange={(e) => set({ category: e.target.value === "all" ? undefined : e.target.value })}
            className="h-9 rounded-lg border border-border bg-surface-2 px-2 text-xs"
          >
            <option value="all">Tất cả danh mục</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={search.tech ?? "all"}
            onChange={(e) => set({ tech: e.target.value === "all" ? undefined : e.target.value })}
            className="h-9 rounded-lg border border-border bg-surface-2 px-2 text-xs"
          >
            <option value="all">Tất cả công nghệ</option>
            {TECHS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={search.price ?? "all"}
            onChange={(e) =>
              set({ price: e.target.value === "all" ? undefined : (e.target.value as "free" | "paid") })
            }
            className="h-9 rounded-lg border border-border bg-surface-2 px-2 text-xs"
          >
            <option value="all">Tất cả mức giá</option>
            <option value="free">Miễn phí</option>
            <option value="paid">Có phí</option>
          </select>
          <select
            value={String(search.minRating ?? 0)}
            onChange={(e) => set({ minRating: Number(e.target.value) || undefined })}
            className="h-9 rounded-lg border border-border bg-surface-2 px-2 text-xs"
          >
            <option value="0">Tất cả đánh giá</option>
            <option value="4">Từ 4★ trở lên</option>
            <option value="4.5">Từ 4.5★ trở lên</option>
          </select>
          <select
            value={search.sort ?? "sales"}
            onChange={(e) => set({ sort: e.target.value as SearchParams["sort"] })}
            className="ml-auto h-9 rounded-lg border border-border bg-surface-2 px-2 text-xs"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {isError && (
          <div className="mt-8 rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-sm">
            Không thể tải dữ liệu: {(error as Error).message}
          </div>
        )}

        {/* Lưới sản phẩm */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isPending
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : data?.items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {/* Khi không có kết quả */}
        {!isPending && data && data.items.length === 0 && (
          <div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center">
            <p className="font-semibold text-lg">Không tìm thấy mã nguồn nào phù hợp</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Hãy thử tìm kiếm với từ khóa khác hoặc bỏ bớt các điều kiện lọc.
            </p>
          </div>
        )}

        {/* Phân trang */}
        {data && data.pageCount > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: data.pageCount }).map((_, i) => {
              const page = i + 1;
              const active = (search.page ?? 1) === page;
              return (
                <button
                  key={page}
                  onClick={() =>
                    navigate({ search: (prev) => ({ ...prev, page: page === 1 ? undefined : page }) })
                  }
                  className={
                    active
                      ? "size-9 rounded-lg bg-primary text-sm font-bold text-primary-foreground"
                      : "size-9 rounded-lg border border-border bg-surface-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  }
                >
                  {page}
                </button>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
