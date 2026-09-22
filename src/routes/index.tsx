import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search, Sparkles, ArrowRight, BadgeCheck, Star, Zap } from "lucide-react";
import { categoriesQuery, homeSectionsQuery, type ProductCardRow } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { formatCount } from "@/lib/format";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileNav } from "@/components/site/MobileNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CodeStore — Sàn Mua Bán Source Code, Roblox Scripts & Templates" },
      {
        name: "description",
        content:
          "Chợ mua bán mã nguồn, Roblox Luau scripts, template HTML/CSS/JS, dự án Python và UI kits. Giao dịch tức thì, mở khóa copy trực tiếp.",
      },
      { property: "og:title", content: "CodeStore — Sàn Mua Bán Mã Nguồn Dành Cho Lập Trình Viên" },
      {
        property: "og:description",
        content:
          "Mua bán source code, Roblox scripts, template website đã được kiểm duyệt an toàn.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(homeSectionsQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
    ]);
  },
  component: Home,
});

function Section({
  title,
  subtitle,
  items,
  accent,
}: {
  title: string;
  subtitle?: string;
  items: ProductCardRow[];
  accent?: boolean;
}) {
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
            {accent && <Zap className="size-5 text-primary" />}
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <Link
          to="/explore"
          className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Xem tất cả <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

function Home() {
  const { data } = useSuspenseQuery(homeSectionsQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
      <Header />

      <main className="flex-1 pb-8">
        {/* Hero Banner */}
        <section className="relative overflow-hidden border-b border-border">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%)",
            }}
          />
          <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" /> Lập trình viên uy tín · Mở khóa tức thì
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight sm:text-6xl tracking-tight">
              BUILD <span className="text-muted-foreground">•</span> BUY{" "}
              <span className="text-muted-foreground">•</span>{" "}
              <span className="text-primary">SELL</span>{" "}
              <span className="text-muted-foreground">•</span> CREATE
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
              Source code, Roblox Luau scripts, template website, tool Python và UI kits —
              từ lập trình viên, cho lập trình viên.
            </p>

            <form
              className="relative mx-auto mt-8 max-w-xl"
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/explore", search: { q: term || undefined } });
              }}
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Tìm admin system, dashboard, Luau script..."
                className="h-14 w-full rounded-2xl border border-border bg-surface pl-12 pr-32 text-base outline-hidden placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 h-10 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Tìm kiếm
              </button>
            </form>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {categories.slice(0, 8).map((c) => (
                <Link
                  key={c.id}
                  to="/explore"
                  search={{ category: c.slug }}
                  className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Danh mục */}
        <section className="mx-auto max-w-7xl px-4 py-10">
          <h2 className="mb-5 text-xl font-bold sm:text-2xl">Khám phá theo danh mục</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {categories.map((c) => (
              <Link
                key={c.id}
                to="/explore"
                search={{ category: c.slug }}
                className="rounded-xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40"
              >
                <div className="text-2xl">{c.icon ?? "📦"}</div>
                <div className="mt-2 truncate text-xs font-medium">{c.name}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Các khu vực hàng */}
        <Section
          title="Flash deals chớp nhoáng"
          subtitle="Ưu đãi giới hạn thời gian"
          items={data.flash}
          accent
        />
        <Section title="Đang thịnh hành" subtitle="Nhiều lượt quan tâm nhất tuần" items={data.trending} />
        <Section title="Bán chạy nhất" subtitle="Doanh số được xác thực cao nhất" items={data.bestSellers} />
        <Section title="Mới phát hành" subtitle="Vừa đăng tải gần đây" items={data.newReleases} />
        <Section title="Mã nguồn miễn phí" subtitle="Nhận và trải nghiệm ngay" items={data.free} />
        <Section title="Mới cập nhật" subtitle="Phiên bản vá lỗi và nâng cấp mới" items={data.recentlyUpdated} />

        {/* Lập trình viên tiêu biểu */}
        <section className="mx-auto max-w-7xl px-4 py-10">
          <h2 className="mb-5 text-xl font-bold sm:text-2xl">Lập trình viên tiêu biểu</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.sellers.map((s) => (
              <div key={s.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/15 font-display font-bold text-primary">
                    {s.store_name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 truncate font-semibold">
                      {s.store_name}
                      {s.is_verified && <BadgeCheck className="size-4 shrink-0 text-primary" />}
                    </div>
                    <div className="text-xs text-muted-foreground">Người bán {s.level}</div>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{s.tagline}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="size-3.5 fill-warning text-warning" />
                    {Number(s.rating).toFixed(1)} ({s.rating_count})
                  </span>
                  <span>{formatCount(s.total_sales)} lượt mua</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
