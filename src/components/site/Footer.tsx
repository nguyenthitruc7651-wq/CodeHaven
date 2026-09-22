import { Link } from "@tanstack/react-router";
import { Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Code2 className="size-4.5" />
            </span>
            <span className="font-display text-lg font-bold">CodeStore</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Sàn giao dịch mã nguồn uy tín: Roblox Luau scripts, template website, tool Python và tài nguyên lập trình viên.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Chợ mã nguồn</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/explore" className="hover:text-foreground">
                Khám phá kho code
              </Link>
            </li>
            <li>
              <Link to="/explore" search={{ price: "free" }} className="hover:text-foreground">
                Mã nguồn miễn phí
              </Link>
            </li>
            <li>
              <Link to="/sell" className="hover:text-foreground">
                Trở thành người bán
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Tài khoản</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/library" className="hover:text-foreground">
                Thư viện đã mua
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-foreground">
                Ví &amp; Hồ sơ cá nhân
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-foreground">
                Đăng nhập / Đăng ký
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">An toàn &amp; Bảo mật</h4>
          <p className="mt-3 text-sm text-muted-foreground">
            Mọi thanh toán, phân quyền và tải file đều được xác thực an toàn từ máy chủ. File mã nguồn trả phí được lưu trữ riêng biệt, không thể truy cập trái phép.
          </p>
        </div>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CodeStore. Nền tảng chia sẻ mã nguồn bản quyền dành cho lập trình viên.
      </div>
    </footer>
  );
}
