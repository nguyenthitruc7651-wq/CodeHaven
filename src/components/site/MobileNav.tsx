import { Link } from "@tanstack/react-router";
import { Home, Compass, Store, Library, User2 } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Trang chủ", icon: Home },
  { to: "/explore", label: "Khám phá", icon: Compass },
  { to: "/sell", label: "Đăng bán", icon: Store },
  { to: "/library", label: "Thư viện", icon: Library },
  { to: "/profile", label: "Cá nhân", icon: User2 },
] as const;

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 glass md:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground transition-colors"
              activeProps={{ className: "text-primary font-medium" }}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
