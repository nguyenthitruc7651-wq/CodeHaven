import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Library as LibraryIcon, Lock } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileNav } from "@/components/site/MobileNav";
import { useAuth } from "@/hooks/useAuth";
import { myPurchasesQuery } from "@/lib/commerce";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/library")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Thư viện mã nguồn đã mua — CodeStore" },
      {
        name: "description",
        content:
          "Tất cả script, template và bộ UI bạn đang sở hữu trên CodeStore với mã nguồn đầy đủ, bôi đen và copy tự do.",
      },
      { property: "og:title", content: "Thư viện mã nguồn — CodeStore" },
      { property: "og:description", content: "Mã nguồn bạn đã mua, mở khóa và sẵn sàng sao chép." },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { user, loading } = useAuth();
  const { data, isPending, error } = useQuery(myPurchasesQuery(user?.id));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-8 md:pb-12">
        <h1 className="font-display text-3xl font-bold">Thư viện của bạn</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Code bạn đã mua — mở khoá hoàn toàn, bôi đen và copy thoải mái.
        </p>

        {!loading && !user && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center">
            <Lock className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Đăng nhập để xem code bạn sở hữu.</p>
            <Link
              to="/auth"
              className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Đăng nhập ngay
            </Link>
          </div>
        )}

        {user && isPending && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface-2" />
            ))}
          </div>
        )}

        {error && (
          <p className="mt-8 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
            Không tải được thư viện. Vui lòng thử lại sau.
          </p>
        )}

        {user && data && data.length === 0 && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center">
            <LibraryIcon className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Bạn chưa sở hữu mã nguồn nào.</p>
            <Link
              to="/explore"
              className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Khám phá kho code
            </Link>
          </div>
        )}

        {user && data && data.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((row) => {
              const p = row.product as {
                slug: string;
                title: string;
                summary: string;
                technologies: string[] | null;
              } | null;
              if (!p) return null;
              return (
                <Link
                  key={row.id}
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:-translate-y-0.5"
                >
                  <h2 className="font-semibold text-foreground">{p.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.summary}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono">
                      v{row.version_at_purchase}
                    </span>
                    <span>Mua ngày {formatDate(row.created_at)}</span>
                  </div>
                </Link>
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
