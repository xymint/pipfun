export default function MobileFooter() {
  return (
    <footer className="w-full px-4 pb-4">
      <nav className="w-full flex flex-col">
        <div className="w-full flex items-center justify-center gap-2 text-[14px] leading-[20px] [font-family:var(--font-outfit)] text-[var(--tokens-foreground)] font-medium">
          <a href="#" className="h-9 rounded-[var(--radius-md)] px-4 flex items-center justify-center">X</a>
          <a href="#" className="h-9 rounded-[var(--radius-md)] px-4 flex items-center justify-center">Terms</a>
          <a href="#" className="h-9 rounded-[var(--radius-md)] px-4 flex items-center justify-center">Privacy</a>
        </div>
        <div className="w-full flex items-center justify-center gap-2 text-[12px] leading-[16px] [font-family:var(--font-outfit)] text-[var(--tokens-foreground)]">
          <a href="#" className="h-9 rounded-[var(--radius-md)] px-4 flex items-center justify-center">Content &amp; IP</a>
          <a href="#" className="h-9 rounded-[var(--radius-md)] px-4 flex items-center justify-center">Fees</a>
        </div>
      </nav>
      <p className="mt-2 text-center text-[12px] leading-[16px] [font-family:var(--font-outfit)] text-[var(--tokens-foreground)]">
        Digital assets, including memecoins, are highly speculative and may result in total loss. pip.fun is a decentralized, permissionless platform for token creation and does not endorse, audit, or assume responsibility for any user-created tokens. Users are advised to conduct independent research and assess their risk tolerance before participating.
      </p>
    </footer>
  );
}
