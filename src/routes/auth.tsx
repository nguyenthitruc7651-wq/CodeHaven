import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Code2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Đăng nhập hoặc Tạo tài khoản — CodeStore" },
      {
        name: "description",
        content:
          "Tạo tài khoản CodeStore để nạp tiền vào ví, mua mã nguồn, mở khóa copy code và đăng bán các script, template của bạn.",
      },
      { property: "og:title", content: "Đăng nhập hoặc Tạo tài khoản — CodeStore" },
      {
        property: "og:description",
        content: "Một tài khoản duy nhất để mua, mở khóa và đăng bán mã nguồn trên CodeStore.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/profile", replace: true });
  }, [loading, user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (password.length < 6) {
      setError("Mật khẩu cần ít nhất 6 ký tự.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (err) throw err;
        if (!data.session) {
          setInfo("Tài khoản đã tạo thành công! Kiểm tra hộp thư email để kích hoạt rồi đăng nhập.");
          setMode("signin");
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (err) setError(err.message);
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10">
      <Link to="/" className="mx-auto flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Code2 className="size-5" />
        </span>
        <span className="font-display text-xl font-bold">CodeStore</span>
      </Link>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={
                mode === m
                  ? "rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground transition-all"
                  : "rounded-lg py-2 text-sm text-muted-foreground hover:text-foreground transition-all"
              }
            >
              {m === "signin" ? "Đăng nhập" : "Đăng ký"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="email">
              Địa chỉ Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm outline-hidden focus:border-primary/50 focus:ring-2 focus:ring-ring"
              placeholder="tenban@email.com"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="password">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm outline-hidden focus:border-primary/50 focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "signin" ? "Đăng nhập ngay" : "Tạo tài khoản mới"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> hoặc <span className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={google}
          className="h-11 w-full rounded-xl border border-border bg-surface-2 text-sm font-semibold transition-colors hover:border-primary/40"
        >
          Tiếp tục với Google
        </button>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Khi có tài khoản, bạn sẽ có ví riêng để nạp tiền mua code, mở khóa copy và đăng bán kiếm thu nhập.
        </p>
      </div>
    </div>
  );
}
