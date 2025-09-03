"use client";

import { shortenMiddle } from "@/utils/string.util";
import { useToastStore } from "@/store/toastStore";

type CopyTextProps = {
  text: string | null | undefined;
  className?: string;
  iconSize?: number; // tailwind size unit base 4
  shorten?: boolean; // show shortened text for display only
  head?: number;
  tail?: number;
};

export default function CopyText({
  text,
  className = "text-sm font-medium hover:text-white transition-colors",
  iconSize = 4,
  shorten = true,
  head,
  tail,
}: CopyTextProps) {
  const value = text || "";
  const display = shorten ? shortenMiddle(value, head, tail) : value;

  const onCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!value) return;
    try {
      navigator.clipboard.writeText(value).then(() => {
        try {
          useToastStore.getState().show("copied", "success", 1500);
        } catch {}
      });
    } catch {}
  };

  // Ensure required classes are always present
  const required = "cursor-copy inline-flex items-center";
  const mergedClassName = `${required} ${className}`.trim();

  return (
    <span className={mergedClassName} onClick={onCopy} role="button" aria-label="copy">
      <span>{display}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`ml-1`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        width={`${iconSize * 4}px`}
        height={`${iconSize * 4}px`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    </span>
  );
}
