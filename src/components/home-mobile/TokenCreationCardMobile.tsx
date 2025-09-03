"use client";

import { useCallback, useState } from "react";

export default function TokenCreationCardMobile() {
  const [urlInput, setUrlInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrlInput(text);
    } catch {}
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
  }, []);

  return (
    <div
      className="w-full mx-auto rounded-[var(--radius-xl)] border border-white/20 bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] px-5 py-8 text-center"
    >
      <div className="flex w-full flex-col items-center gap-[20px] text-center mb-[40px]">
        <h1 className="[font-family:var(--font-bagel-fat-one)] text-[36px] leading-[40px] bg-clip-text text-transparent bg-gradient-to-b from-[var(--base-white)] to-[var(--orange-50)]">
          CREATE TOKEN
        </h1>
        <p className="w-full text-center [font-family:var(--font-outfit)] text-[16px] leading-[24px] text-white">
          Turn any website or link into a token.
          <br />
          AI will analyze the page and build a concept instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={`w-full space-y-3 ${isSubmitting ? "opacity-50" : ""}`}>
        <div
          className={`flex flex-row items-center justify-between box-border rounded-[var(--radius-xl)] border ${urlInput.trim().length > 0 ? "border-white" : "border-white/50"} bg-white/20 px-5 py-4 backdrop-blur-[12px] focus-within:border-white`}
        >
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Enter your URL"
            className="flex-1 bg-transparent font-medium text-[16px] leading-[24px] [font-family:var(--font-outfit)] text-white placeholder-white outline-none"
          />
          <button
            type="button"
            onClick={handlePaste}
            className="rounded bg-white/20 px-2 py-1 text-white text-[12px] leading-[16px] [font-family:var(--font-outfit)]"
          >
            Paste
          </button>
        </div>

        <span className="px-2 py-1 rounded-[var(--radius)] bg-red-600 text-red-100 text-[14px] leading-[20px] [font-family:var(--font-outfit)] inline-block">Enter a valid URL</span>

        <button
          type="submit"
          className="w-full h-[70px] rounded-[var(--radius-xl)] bg-[var(--pip-primary)] font-semibold text-white text-[20px] leading-[24px] [font-family:var(--font-bagel-fat-one)] shadow-[inset_0_-2px_5px_0_rgba(0,0,0,0.32)]"
        >
          COOK IT
        </button>
      </form>
    </div>
  );
}
