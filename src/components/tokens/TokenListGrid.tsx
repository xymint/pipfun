import CopyText from "@/utils/CopyText";
import Link from "next/link";

type Token = {
  id: string;
  name?: string;
  ticker?: string;
  imageUrl?: string;
  contractAddress?: string;
  curveProgress?: number;
};

export default function TokenListGrid({ tokens }: { tokens: Token[] | null }) {
  if (tokens === null) {
    // detailed skeleton rows (match card layout)
    const sk = Array.from({ length: 12 }).map((_, i) => i);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 justify-center">
        {sk.map((i) => (
          <div key={i} className="w-full md:w-[300px] rounded-[var(--radius-lg)] border border-[var(--tokens-border)] bg-[var(--card)] p-3 flex gap-3">
            <div className="flex-none min-w-[120px] w-[120px] h-[120px] rounded-[var(--radius-md)] overflow-hidden bg-[var(--tokens-secondary)] animate-pulse" />
            <div className="flex flex-col flex-grow">
              <div className="h-[28px] rounded-[var(--radius-md)] bg-[var(--tokens-secondary)] animate-pulse" />
              <div className="mt-2 h-[16px] w-[75%] rounded-[var(--radius-md)] bg-[var(--tokens-secondary)] animate-pulse" />
              <div className="mt-auto h-[16px] rounded-[var(--radius-md)] bg-[var(--tokens-secondary)] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!tokens || tokens.length === 0) {
    return (
      <div className="text-center text-[var(--tokens-foreground)] text-[14px] leading-[20px]">no tokens found</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 justify-center">
      {tokens.map((t) => {
        const raw = Number((t as any).curveProgress ?? 0);
        const cp = Number.isFinite(raw) ? raw : 0;
        const cpLabel = cp.toFixed(2);
        const cpWidth = `${Math.max(0, Math.min(100, cp))}%`;
        return (
          <Link key={t.id} href={`/tokens/${t.id}`} className="w-full md:w-[300px] rounded-[var(--radius-lg)] border border-[var(--tokens-border)] bg-[var(--card)] p-3 min-w-0 flex gap-3 transition-colors">
            <div className="flex-none min-w-[120px] w-[120px] h-[120px] rounded-[var(--radius-md)] overflow-hidden bg-[var(--tokens-secondary)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.imageUrl || "/token-holder.png"} alt={t.ticker || t.name || "token"} className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow flex flex-col min-w-0">
              <div className="text-[var(--pip-primary)] text-[18px] leading-[22px] font-semibold">{t.ticker || "TOKEN"}</div>
              <div className="text-[var(--tokens-secondary-foreground)] text-[14px] leading-[20px] [overflow-wrap:anywhere]">{t.name || "-"}</div>
              <div className="mt-2">
                <CopyText text={t.contractAddress || ""} className="text-[var(--muted-foreground)] text-[12px] leading-[16px]" />
              </div>
              <div className="mt-auto">
                <div className="text-[var(--muted-foreground)] text-[12px] leading-[16px]">BC <strong className="text-[var(--pip-primary)]">{cpLabel}%</strong></div>
                <div className="mt-1 h-1 rounded bg-[var(--tokens-secondary)]">
                  <div className="h-1 rounded bg-[var(--tokens-foreground)]" style={{ width: cpWidth }} />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
