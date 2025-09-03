import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function TokenListPagination({ currentPage, totalPages, onPageChange }: Props) {
  const pages: number[] = [];
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages, currentPage + 1);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        className="h-[40px] px-4 text-[var(--tokens-foreground)] text-[14px] leading-[20px] font-medium inline-flex items-center gap-1 disabled:opacity-50"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="w-4 h-4" aria-hidden />
        Previous
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`h-[40px] w-[40px] rounded-[var(--radius-md)] border flex items-center justify-center text-[14px] leading-[20px] font-medium ${
            p === currentPage
              ? "bg-[var(--tokens-background)] border-[var(--tokens-border)] text-[var(--tokens-foreground)]"
              : "border-transparent text-[var(--tokens-foreground)]"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        className="h-[40px] px-4 text-[var(--tokens-foreground)] text-[14px] leading-[20px] font-medium inline-flex items-center gap-1 disabled:opacity-50"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
      >
        Next
        <ChevronRight className="w-4 h-4" aria-hidden />
      </button>
    </div>
  );
}
