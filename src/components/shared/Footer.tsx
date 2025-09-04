export default function Footer() {
  return (
    <footer className="w-[800px] mx-auto pb-4">
      <div className="w-full flex flex-col items-center gap-2 text-center">
        <nav className="flex items-center justify-center gap-2 text-[14px] leading-[20px] [font-family:var(--font-outfit)] font-medium text-[var(--tokens-foreground)]">
          <a href="https://x.com/getpipcom" target="_blank" className="h-8 px-4 py-0 rounded-[var(--radius-md)] flex items-center">
            X
          </a>
          <a href="/terms" className="h-8 px-4 py-0 rounded-[var(--radius-md)] flex items-center">
            Terms
          </a>
          <a href="/privacy" className="h-8 px-4 py-0 rounded-[var(--radius-md)] flex items-center">
            Privacy
          </a>
          <a href="/content-ip" className="h-8 px-4 py-0 rounded-[var(--radius-md)] flex items-center">
            Content &amp; IP
          </a>
          <a href="/fees" className="h-8 px-4 py-0 rounded-[var(--radius-md)] flex items-center">
            Fees
          </a>
        </nav>
        <p className="mt-2 w-full text-[12px] leading-[16px] [font-family:var(--font-outfit)] text-[var(--tokens-foreground)]">
          Digital assets, including memecoins, are highly speculative and may result in total loss. pip.fun is a decentralized, permissionless platform for token creation and does not endorse, audit, or assume responsibility for any user-created tokens. Users are advised to conduct independent research and assess their risk tolerance before participating.
        </p>
      </div>
    </footer>
  );
}
