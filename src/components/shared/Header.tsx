"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useWalletStore } from "@/store/walletStore";
import { shortenMiddle } from "@/utils/string.util";
import { useOverlayStore } from "@/store/overlayStore";
import { useTokenCreationFlowStore } from "@/store/tokenCreationFlowStore";
import { cn } from "@/lib/utils";
import { isMobile } from "@/utils/device";

export default function Header() {
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const connectBtnRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const walletAddress = useWalletStore((s) => s.walletAddress);
  const connectWallet = useWalletStore((s) => s.connectWallet);
  const disconnectWallet = useWalletStore((s) => s.disconnectWallet);
  const resetOverlays = useOverlayStore((s) => s.resetOverlays);
  const resetFlow = useTokenCreationFlowStore((s) => s.reset);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;
      if (
        isConnectOpen &&
        target &&
        !connectBtnRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setIsConnectOpen(false);
      }
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsConnectOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [isConnectOpen]);

  return (
    <header className="px-4 py-4 md:px-8 md:py-4">
      <div className="flex h-full items-center justify-between">
        <Link href="/" className="select-none leading-none" onClick={() => { resetOverlays(); resetFlow(); }}>
          <Image src="/logo.svg" alt="pip.fun" width={112} height={27} priority />
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/tokenlist"
            className={cn(
              "h-9 md:h-11 rounded-[var(--radius-md)] bg-[var(--tokens-secondary)] px-3 md:px-4",
              "[font-family:var(--font-outfit)] font-medium",
              "text-[16px] leading-[24px]",
              "text-[var(--tokens-secondary-foreground)] flex items-center gap-2"
            )}
          >
            <span className="hidden md:block">Explore</span>
            <Image src="/icon-explore.svg" alt="Explore" width={13.3} height={13.3} />
          </Link>

          <Link
            href="/"
            onClick={() => { resetOverlays(); resetFlow(); }}
            className={cn(
              "h-9 md:h-11 rounded-[var(--radius-md)] bg-[var(--pip-primary)] px-3 md:px-4",
              "[font-family:var(--font-outfit)] font-medium",
              "text-[16px] leading-[24px]",
              "text-[var(--pip-primary-foreground)] flex items-center gap-2"
            )}
          >
            <span className="hidden md:block">Create</span>
            <Image src="/icon-plus.svg" alt="Create" width={13.3} height={13.3} />
          </Link>

          <div className="relative">
            <button
              ref={connectBtnRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={isConnectOpen}
              aria-controls="connect-dropdown"
              onClick={() => setIsConnectOpen((v) => !v)}
              className={cn(
                "h-9 md:h-11 rounded-[var(--radius-md)] bg-[var(--tokens-secondary)] px-3 md:px-4",
                "[font-family:var(--font-outfit)] font-medium",
                "text-[14px] leading-[20px]",
                "md:text-[16px] md:leading-[24px]",
                "text-[var(--tokens-secondary-foreground)] flex items-center cursor-pointer"
              )}
            >
              {walletAddress
                ? shortenMiddle(walletAddress, 4, 4)
                : "Connect"}
            </button>

            {isConnectOpen ? (
              <div
                id="connect-dropdown"
                ref={dropdownRef}
                role="menu"
                aria-labelledby="connect-button"
                className="absolute right-0 top-full mt-2 w-[160px]"
                style={{ boxShadow: "var(--tokens-shadow-md)" }}
              >
                <div className="flex flex-col rounded-[var(--radius-md)] border border-[var(--tokens-border)] bg-[var(--tokens-popover)] items-center bg-[var(--tokens-popover)] text-[var(--tokens-popover-foreground)] text-[16px] leading-[24px] [font-family:var(--font-outfit)]">
                  {walletAddress ? (
                    <>
                      <div className="w-full p-2">
                        <button
                          role="menuitem"
                          className="block w-full text-left px-2 py-1.5 rounded-[var(--radius-md)] hover:bg-[var(--tokens-secondary)] [font-family:var(--font-outfit)] text-[16px]"
                          onClick={() => {
                            setIsConnectOpen(false);
                            window.location.href = "/my-tokens";
                          }}
                        >
                          My tokens
                        </button>
                      </div>
                      <div className="w-full p-2">
                        <button
                          role="menuitem"
                          className="block w-full text-left px-2 py-1.5 rounded-[var(--radius-md)] hover:bg-[var(--tokens-secondary)] [font-family:var(--font-outfit)] text-[16px]"
                          onClick={() => {
                            setIsConnectOpen(false);
                            disconnectWallet();
                          }}
                        >
                          Disconnect
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full p-2">
                        <button
                          role="menuitem"
                          className="block w-full text-left px-2 py-1.5 rounded-[var(--radius-md)] hover:bg-[var(--tokens-secondary)] [font-family:var(--font-outfit)] text-[16px]"
                          onClick={async () => {
                            setIsConnectOpen(false);
                            await connectWallet("Phantom");
                          }}
                        >
                          Phantom
                        </button>
                      </div>
                      {!isMobile() && (
                        <>
                          <div className="w-full p-2">
                            <button
                              role="menuitem"
                              className="block w-full text-left px-2 py-1.5 rounded-[var(--radius-md)] hover:bg-[var(--tokens-secondary)] [font-family:var(--font-outfit)] text-[16px]"
                              onClick={async () => {
                                setIsConnectOpen(false);
                                await connectWallet("Backpack");
                              }}
                            >
                              Backpack
                            </button>
                          </div>
                          <div className="w-full p-2">
                            <button
                              role="menuitem"
                              className="block w-full text-left px-2 py-1.5 rounded-[var(--radius-md)] hover:bg-[var(--tokens-secondary)] [font-family:var(--font-outfit)] text-[16px]"
                              onClick={async () => {
                                setIsConnectOpen(false);
                                await connectWallet("Solflare");
                              }}
                            >
                              Solflare
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
