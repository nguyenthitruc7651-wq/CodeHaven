import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Heart, ShoppingCart, User2, Code2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { to: "/explore", label: "Khám phá" },
  { to: "/sell", label: "Đăng bán code" },
  { to: "/library", label: "Thư viện đã mua" },
] as const;

export function Header() {
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Code2 className="size-4.5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">CodeStore</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form
          className="relative ml-auto hidden max-w-md flex-1 md:block"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/explore", search: { q: term || undefined } });
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Tìm kiếm source code, Roblox script, template..."
            className="h-10 w-full rounded-xl border border-border bg-surface-2 pl-9 pr-3 text-sm outline-hidden placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-ring"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link
            to="/library"
            className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            aria-label="Wishlist"
          >
            <Heart className="size-4.5" />
          </Link>
          <Link
            to="/library"
            className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            aria-label="Cart"
          >
            <ShoppingCart className="size-4.5" />
          </Link>
          {user ? (
            <Link
              to="/profile"
              className="grid size-9 place-items-center rounded-lg bg-surface-2 text-foreground"
              aria-label="Profile"
            >
              <User2 className="size-4.5" />
            </Link>
          ) : (
            <Link
              to="/auth"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
