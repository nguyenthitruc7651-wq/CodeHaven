import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const walletQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["wallet", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("user_wallets")
        .select("balance_cents, total_topped_up_cents")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data ?? { balance_cents: 0, total_topped_up_cents: 0 };
    },
  });

export const creditHistoryQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["credit-history", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("id, kind, amount_cents, balance_after_cents, note, created_at")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

export const myPurchasesQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["purchases", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select(
          "id, created_at, license_type, version_at_purchase, product:products ( id, slug, title, summary, thumbnail_url, technologies, current_version )",
        )
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

/** Kiểm tra quyền sở hữu sản phẩm (chạy theo quyền bảo mật của người dùng đăng nhập) */
export const ownsProductQuery = (productId: string | undefined, userId: string | undefined) =>
  queryOptions({
    queryKey: ["owns", productId, userId],
    enabled: Boolean(productId && userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select("id")
        .eq("product_id", productId!)
        .is("revoked_at", null)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return Boolean(data);
    },
  });

/** Lấy toàn bộ mã nguồn — chỉ người bán hoặc người đã mua mới có quyền đọc */
export const productSourceQuery = (productId: string | undefined, unlocked: boolean) =>
  queryOptions({
    queryKey: ["product-source", productId, unlocked],
    enabled: Boolean(productId) && unlocked,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_sources")
        .select("code, language")
        .eq("product_id", productId!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

export const mySellerQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["my-seller", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sellers")
        .select("id, store_name, slug, tagline, level, is_verified, total_sales, rating")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

export const myProductsQuery = (sellerId: string | undefined) =>
  queryOptions({
    queryKey: ["my-products", sellerId],
    enabled: Boolean(sellerId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, slug, title, summary, price_cents, is_free, status, technologies, sales_count, current_version, category_id, description",
        )
        .eq("seller_id", sellerId!)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

export const sellerWalletQuery = (sellerId: string | undefined) =>
  queryOptions({
    queryKey: ["seller-wallet", sellerId],
    enabled: Boolean(sellerId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallets")
        .select("total_revenue_cents, pending_cents, available_cents, withdrawn_cents")
        .eq("seller_id", sellerId!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

export function slugify(input: string) {
  return (
    input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "asset"
  );
}

export async function topUpWallet(amountCents: number) {
  const { data, error } = await supabase.rpc("topup_wallet", { _amount_cents: amountCents });
  if (error) throw new Error(error.message);
  return data as number;
}

export async function purchaseProduct(productId: string) {
  const { data, error } = await supabase.rpc("purchase_product", { _product_id: productId });
  if (error) {
    if (error.message.includes("INSUFFICIENT_FUNDS")) throw new Error("INSUFFICIENT_FUNDS");
    throw new Error(error.message);
  }
  return data as { already_owned: boolean; balance_cents?: number; price_cents?: number };
}
