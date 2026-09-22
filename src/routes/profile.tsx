import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Sparkles,
  LogOut,
  ShoppingBag,
  Code2,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileNav } from "@/components/site/MobileNav";
import { useAuth } from "@/hooks/useAuth";
import { walletQuery, creditHistoryQuery, topUpWallet } from "@/lib/commerce";
import { formatVND, formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Ví & Tài khoản cá nhân — CodeStore" },
      {
        name: "description",
        content: "Quản lý số dư ví, nạp tiền qua MoMo/QR Banking và xem lịch sử giao dịch trên CodeStore.",
      },
    ],
  }),
  component: ProfilePage,
});

const PRESET_AMOUNTS = [20000, 50000, 100000, 200000, 500000];

function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, signOut, loading: authLoading } = useAuth();

  const { data: wallet, isPending: walletLoading } = useQuery(walletQuery(user?.id));
  const { data: history } = useQuery(creditHistoryQuery(user?.id));

  const [topupAmount, setTopupAmount] = useState<number>(50000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "qr" | "bank">("qr");
  const [isProcessing, setIsProcessing] = useState(false);

  // Nếu chưa đăng nhập
  if (!authLoading && !user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Wallet className="size-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold font-display">Đăng nhập tài khoản</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Vui lòng đăng nhập để xem số dư ví, nạp tiền và quản lý mã nguồn đã sở hữu.
          </p>
          <Link
            to="/auth"
            className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Đăng nhập ngay
          </Link>
        </main>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  const handlePresetSelect = (amount: number) => {
    setTopupAmount(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (val: string) => {
    setCustomAmount(val);
    const num = parseInt(val.replace(/\D/g, ""), 10);
    if (!isNaN(num)) {
      setTopupAmount(num);
    }
  };

  const handleTopup = async () => {
    if (topupAmount < 10000) {
      toast.error("Số tiền nạp tối thiểu là 10.000đ.");
      return;
    }

    setIsProcessing(true);
    try {
      await topUpWallet(topupAmount);
      toast.success(`Nạp thành công ${formatVND(topupAmount)} vào ví!`);
      // Refresh dữ liệu ví và lịch sử
      await queryClient.invalidateQueries({ queryKey: ["wallet", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["credit-history", user?.id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nạp tiền thất bại, vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Đã đăng xuất tài khoản.");
    navigate({ to: "/" });
  };

  const currentBalance = wallet?.balance_cents ?? 0;
  const totalToppedUp = wallet?.total_topped_up_cents ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-16 md:pb-0">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {/* Banner tiêu đề & Đăng xuất */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
              {user?.email?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div>
              <h1 className="text-xl font-bold font-display sm:text-2xl">{user?.email}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1 text-xs text-primary font-medium">
                  <ShieldCheck className="size-3.5" /> Tài khoản đã xác thực
                </span>
                <span className="text-xs text-muted-foreground">• ID: {user?.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/library"
              className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-xs font-semibold hover:border-primary/40 transition-colors"
            >
              <ShoppingBag className="size-4" /> Thư viện của tôi
            </Link>
            <Link
              to="/sell"
              className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              <Code2 className="size-4" /> Kênh người bán
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive/20 transition-colors"
            >
              <LogOut className="size-3.5" /> Thoát
            </button>
          </div>
        </div>

        {/* Thẻ số dư ví */}
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-primary/30 bg-radial-[at_top_left] from-primary/15 via-card to-card p-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Số dư khả dụng
              </span>
              <div className="rounded-lg bg-primary/20 p-2 text-primary">
                <Wallet className="size-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold tracking-tight text-foreground font-display">
                {walletLoading ? "..." : formatVND(currentBalance)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Dùng để mua code mở khóa tức thì mà không cần thanh toán thẻ từng lần.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tổng tiền đã nạp
              </span>
              <div className="rounded-lg bg-surface-2 p-2 text-muted-foreground">
                <ArrowDownLeft className="size-5 text-emerald-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold tracking-tight font-display">
                {walletLoading ? "..." : formatVND(totalToppedUp)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Tổng nạp tích lũy từ khi tạo tài khoản</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="size-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Đặc quyền số dư</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Khi có số dư, bạn có thể mua code ngay lập tức bằng 1 click. Hệ thống tự động trừ ví an toàn qua server-side RPC.
              </p>
            </div>
            <div className="text-xs font-medium text-emerald-400 flex items-center gap-1.5 mt-3">
              <CheckCircle2 className="size-3.5" /> Không tốn phí nạp &amp; bảo vệ 48h
            </div>
          </div>
        </div>

        {/* Khung Nạp Tiền & Lịch sử giao dịch */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Cột nạp tiền (7 cột) */}
          <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <Wallet className="size-5 text-primary" />
              <h2 className="text-lg font-bold font-display">Nạp tiền vào ví</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Chọn mức tiền muốn nạp hoặc nhập số tiền tùy chọn.
            </p>

            {/* Chọn số tiền sẵn */}
            <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-5">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handlePresetSelect(amt)}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${
                    topupAmount === amt && !customAmount
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                      : "border-border bg-surface-2 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {formatVND(amt)}
                </button>
              ))}
            </div>

            {/* Hoặc nhập số tiền tùy ý */}
            <div className="mt-4">
              <label className="text-xs text-muted-foreground" htmlFor="custom-amount">
                Hoặc nhập số tiền khác (VNĐ)
              </label>
              <div className="relative mt-1">
                <input
                  id="custom-amount"
                  type="number"
                  step="10000"
                  min="10000"
                  placeholder="Ví dụ: 150000"
                  value={customAmount}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm outline-hidden focus:border-primary/50 focus:ring-2 focus:ring-ring font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                  VNĐ
                </span>
              </div>
            </div>

            {/* Chọn phương thức nạp */}
            <div className="mt-6">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Phương thức nạp tiền
              </label>
              <div className="mt-2.5 grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("qr")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all ${
                    paymentMethod === "qr"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface-2 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <span className="font-bold">VietQR</span>
                  <span className="text-[10px] text-muted-foreground">Quét mọi ngân hàng</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("momo")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all ${
                    paymentMethod === "momo"
                      ? "border-pink-500 bg-pink-500/10 text-pink-400"
                      : "border-border bg-surface-2 text-muted-foreground hover:border-pink-500/40"
                  }`}
                >
                  <span className="font-bold">Ví MoMo</span>
                  <span className="text-[10px] text-muted-foreground">Thanh toán tức thì</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all ${
                    paymentMethod === "bank"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface-2 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <span className="font-bold">Chuyển khoản</span>
                  <span className="text-[10px] text-muted-foreground">Số tài khoản 24/7</span>
                </button>
              </div>
            </div>

            {/* Nút xác nhận nạp */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground">Số tiền thực nạp:</span>
                <div className="text-xl font-extrabold text-primary font-display">
                  {formatVND(topupAmount)}
                </div>
              </div>

              <button
                type="button"
                onClick={handleTopup}
                disabled={isProcessing || topupAmount < 10000}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Đang xử lý...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="size-4" /> Xác nhận nạp ví
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Cột lịch sử biến động số dư (5 cột) */}
          <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <Clock className="size-5 text-muted-foreground" />
              <h2 className="text-lg font-bold font-display">Lịch sử giao dịch</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              30 giao dịch gần nhất của tài khoản.
            </p>

            <div className="mt-5 space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {(!history || history.length === 0) && (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  Chưa có giao dịch nạp hoặc mua nào.
                </div>
              )}

              {history?.map((tx) => {
                const isPlus = tx.amount_cents > 0;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface-2 p-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid size-8 place-items-center rounded-lg ${
                          isPlus
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-destructive/15 text-destructive-foreground"
                        }`}
                      >
                        {isPlus ? (
                          <ArrowDownLeft className="size-4" />
                        ) : (
                          <ArrowUpRight className="size-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground line-clamp-1">{tx.note || tx.kind}</p>
                        <p className="text-[11px] text-muted-foreground">{formatDate(tx.created_at)}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-mono font-bold ${
                          isPlus ? "text-emerald-400" : "text-foreground"
                        }`}
                      >
                        {isPlus ? "+" : ""}
                        {formatVND(tx.amount_cents)}
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        Dư: {formatVND(tx.balance_after_cents)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
                  }
