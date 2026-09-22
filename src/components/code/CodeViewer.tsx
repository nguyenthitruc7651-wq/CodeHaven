import { useState } from "react";
import { Copy, Check, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface CodeViewerProps {
  code: string;
  language: string;
  unlocked: boolean;
  onBuyClick?: () => void;
  priceText?: string;
}

// Danh sách từ khóa phổ biến của hầu hết các ngôn ngữ (JS/TS, Python, Luau/Roblox, C/C++, Go, Rust, Java, v.v.)
const KEYWORDS = new Set([
  "function", "const", "let", "var", "if", "else", "elif", "then", "end",
  "return", "import", "export", "from", "default", "class", "extends",
  "def", "async", "await", "for", "while", "do", "in", "of", "break", "continue",
  "try", "catch", "finally", "throw", "switch", "case", "new", "this", "self",
  "local", "nil", "null", "undefined", "true", "false", "and", "or", "not",
  "type", "interface", "public", "private", "protected", "static", "struct", "enum"
]);

// Hàm tách từ và chỉ tô màu cho keyword
function renderHighlightedCode(rawCode: string) {
  const lines = rawCode.split("\n");

  return lines.map((line, lineIdx) => {
    // Regex tách từ khóa, chuỗi ký tự, và các ký tự đặc biệt
    const tokens = line.split(/(\b[a-zA-Z_][a-zA-Z0-9_]*\b|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`.*?`)/g);

    return (
      <div key={lineIdx} className="table-row">
        {/* Số dòng */}
        <span className="table-cell select-none pr-4 text-right text-xs text-muted-foreground/40 font-mono">
          {lineIdx + 1}
        </span>
        {/* Nội dung dòng */}
        <span className="table-cell font-mono text-xs whitespace-pre leading-relaxed text-foreground/90">
          {tokens.map((token, tokIdx) => {
            // Nếu là từ khóa lập trình -> Tô màu tím/cyan nổi bật
            if (KEYWORDS.has(token)) {
              return (
                <span key={tokIdx} className="text-primary font-semibold">
                  {token}
                </span>
              );
            }
            // Nếu là chuỗi ký tự (strings) -> Màu xanh nhạt dễ nhìn
            if (
              (token.startsWith('"') && token.endsWith('"')) ||
              (token.startsWith("'") && token.endsWith("'")) ||
              (token.startsWith("`") && token.endsWith("`"))
            ) {
              return (
                <span key={tokIdx} className="text-emerald-400">
                  {token}
                </span>
              );
            }
            // Còn lại (tên biến, hàm, số, dấu) -> Giữ nguyên màu chữ trung tính
            return <span key={tokIdx}>{token}</span>;
          })}
        </span>
      </div>
    );
  });
}

export function CodeViewer({
  code,
  language,
  unlocked,
  onBuyClick,
  priceText = "Mua mã nguồn",
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  // Nếu chưa mua, chỉ cho xem 5 dòng đầu
  const lines = code.split("\n");
  const displayCode = unlocked ? code : lines.slice(0, 5).join("\n");

  const handleCopy = () => {
    if (!unlocked) {
      toast.error("Bạn cần mua mã nguồn để mở khóa tính năng sao chép!");
      return;
    }
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Đã sao chép mã nguồn vào bộ nhớ tạm!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-2xl border border-border bg-[#0d1117] overflow-hidden shadow-2xl">
      {/* Header thanh code */}
      <div className="flex items-center justify-between border-b border-border/60 bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="size-3 rounded-full bg-destructive/60 inline-block" />
            <span className="size-3 rounded-full bg-amber-500/60 inline-block" />
            <span className="size-3 rounded-full bg-emerald-500/60 inline-block" />
          </div>
          <span className="ml-2 rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-mono text-muted-foreground uppercase">
            {language || "code"}
          </span>
          {unlocked && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <ShieldCheck className="size-3.5" /> Đã sở hữu
            </span>
          )}
        </div>

        {/* Nút Copy: Vô hiệu hóa và mờ nếu chưa mua, sáng rực rỡ nếu đã mua */}
        <button
          onClick={handleCopy}
          disabled={!unlocked}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            unlocked
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 hover:opacity-90 cursor-pointer"
              : "bg-surface-2 text-muted-foreground/40 border border-border/40 cursor-not-allowed opacity-50"
          }`}
          title={unlocked ? "Sao chép toàn bộ mã nguồn" : "Cần mua để mở khóa sao chép"}
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          <span>{copied ? "Đã copy!" : "Copy code"}</span>
        </button>
      </div>

      {/* Vùng hiển thị code: Chặn bôi đen (select-none) nếu chưa mua, cho bôi đen (select-text) nếu đã mua */}
      <div
        className={`p-4 overflow-x-auto font-mono ${
          unlocked ? "select-text" : "select-none user-select-none"
        }`}
        style={{ fontFamily: "'Fira Mono', monospace" }}
      >
        <div className="table w-full">{renderHighlightedCode(displayCode)}</div>

        {/* Lớp phủ làm mờ nếu chưa mua */}
        {!unlocked && (
          <div className="absolute inset-x-0 bottom-0 top-20 flex flex-col items-center justify-center bg-gradient-to-t from-[#0d1117] via-[#0d1117]/95 to-transparent p-6 text-center select-none backdrop-blur-[2px]">
            <div className="grid size-12 place-items-center rounded-2xl bg-primary/20 text-primary mb-3">
              <Lock className="size-6" />
            </div>
            <h4 className="text-base font-bold text-foreground">
              Mã nguồn đang được bảo vệ
            </h4>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Bạn chưa mua mã nguồn này nên không thể bôi đen hoặc sao chép. Sau khi mua, toàn bộ code sẽ được mở khóa vĩnh viễn.
            </p>
            {onBuyClick && (
              <button
                onClick={onBuyClick}
                className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition-all cursor-pointer"
              >
                {priceText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
