"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useWalletStore } from "@/store/walletStore";
import { shortenMiddle } from "@/utils/string.util";

export default function MobileHeader() {
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const connectBtnRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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
    <header>
      <div className="flex items-center justify-between py-2 px-4">
        <Link href="/" className="select-none leading-none">
          <Image src="/logo.svg" alt="pip.fun" width={115} height={28} priority />
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="#"
            className="h-9 rounded-[var(--radius-md)] bg-[var(--tokens-secondary)] px-3 text-[14px] [font-family:var(--font-outfit)] font-medium text-[var(--tokens-secondary-foreground)] flex items-center"
          >
            <Image src="/icon-explore.svg" alt="Explore" width={16} height={16} />
          </Link>
          <Link
            href="#"
            className="h-9 rounded-[var(--radius-md)] bg-[var(--pip-primary)] px-3 text-[14px] [font-family:var(--font-outfit)] font-medium text-[var(--pip-primary-foreground)] flex items-center"
          >
            <Image src="/icon-plus.svg" alt="Create" width={16} height={16} />
          </Link>
          <div className="relative">
            <button
              ref={connectBtnRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={isConnectOpen}
              aria-controls="connect-dropdown"
              onClick={() => setIsConnectOpen((v) => !v)}
              className="h-11 rounded-[var(--radius-md)] bg-[var(--tokens-secondary)] px-4 text-[16px] leading-[24px] [font-family:var(--font-outfit)] font-medium text-[var(--tokens-secondary-foreground)] flex items-center cursor-pointer"
            >
              {useWalletStore.getState().walletAddress
                ? shortenMiddle(useWalletStore.getState().walletAddress || "", 4, 4)
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
                  {useWalletStore.getState().walletAddress ? (
                    <>
                      <div className="w-full p-2">
                        <button
                          role="menuitem"
                          className="block w-full text-left px-2 py-1.5 rounded-[var(--radius-md)] hover:bg-[var(--tokens-secondary)] [font-family:var(--font-outfit)] text-[16px]"
                          onClick={() => {
                            alert("go to my tokens");
                            setIsConnectOpen(false);
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
                            useWalletStore.getState().disconnectWallet();
                            setIsConnectOpen(false);
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
                        try {
                          await useWalletStore.getState().connectWallet("Phantom");
                        } finally {
                          setIsConnectOpen(false);
                        }
                      }}
                    >
                      Phantom
                    </button>
                  </div>
                  <div className="w-full p-2">
                    <button
                      role="menuitem"
                      className="block w-full text-left px-2 py-1.5 rounded-[var(--radius-md)] hover:bg-[var(--tokens-secondary)] [font-family:var(--font-outfit)] text-[16px]"
                      onClick={async () => {
                        try {
                          await useWalletStore.getState().connectWallet("Backpack");
                        } finally {
                          setIsConnectOpen(false);
                        }
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
                        try {
                          await useWalletStore.getState().connectWallet("Solflare");
                        } finally {
                          setIsConnectOpen(false);
                        }
                      }}
                    >
                      Solflare
                    </button>
                  </div>
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
