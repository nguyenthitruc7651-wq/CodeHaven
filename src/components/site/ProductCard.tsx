import { Link } from "@tanstack/react-router";
import { Star, Download, BadgeCheck, Zap } from "lucide-react";
import type { ProductCardRow } from "@/lib/catalog";
import { formatVnd, formatCount, timeLeft } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: ProductCardRow }) {
  const flash = timeLeft(product.flash_deal_ends_at);

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_60px_-30px_oklch(0.84_0.19_118/0.6)]"
    >
      <div className="relative aspect-16/10 overflow-hidden bg-surface-2">
        {product.thumbnail_url ? (
          <img
            src={product.thumbnail_url}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-xs text-muted-foreground">
            {product.title}
          </div>
        )}
        <div className="absolute left-2 top-2 flex gap-1.5">
          {product.is_free && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
              Free
            </span>
          )}
          {flash && (
            <span className="flex items-center gap-1 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold uppercase text-destructive-foreground">
              <Zap className="size-3" /> {flash}
            </span>
          )}
          {product.is_demo && (
            <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
              Demo
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="truncate">{product.seller?.store_name ?? "Chưa rõ người bán"}</span>
          {product.seller?.is_verified && <BadgeCheck className="size-3.5 text-primary" />}
        </div>
        <h3 className="line-clamp-1 text-base font-semibold text-foreground">{product.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.summary}</p>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {product.technologies?.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-warning text-warning" />
              {Number(product.rating).toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Download className="size-3.5" />
              {formatCount(product.download_count)}
            </span>
          </div>
          <div className="text-right">
            {product.compare_at_price_cents && !product.is_free && (
              <div className="text-[11px] text-muted-foreground line-through">
                {formatVnd(product.compare_at_price_cents)}
              </div>
            )}
            <div className={cn("font-display text-sm font-bold", product.is_free && "text-primary")}>
              {product.is_free ? "MIỄN PHÍ" : formatVnd(product.price_cents)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-16/10 animate-pulse bg-surface-2" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-full animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  );
}
