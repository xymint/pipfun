"use client";

import CopyText from "@/utils/CopyText";
import Link from "next/link";
import { useOverlayStore } from "@/store/overlayStore";
import { useTokenCreationFlowStore } from "@/store/tokenCreationFlowStore";

type Props = {
  imageUrl: string;
  ticker: string;
  name: string;
  contractAddress: string;
  description: string;
  website: string;
  twitter: string;
  youtube: string;
  tiktok: string;
  telegram: string;
  dbcPoolAddress?: string;
  dammV2PoolAddress?: string;
};

export default function TokenDetail({
  imageUrl,
  ticker,
  name,
  contractAddress,
  description,
  website,
  twitter,
  youtube,
  tiktok,
  telegram,
  dbcPoolAddress,
  dammV2PoolAddress,
}: Props) {
  const ensureProtocol = (u: string) => (u && !/^https?:\/\//i.test(u) ? `https://${u}` : u);
  const poolAddress = dammV2PoolAddress || dbcPoolAddress || "";

  return (
    <div className="w-[640px] rounded-[var(--radius-xl)] bg-[var(--card)] shadow-[var(--card-shadow)] p-8">
      <div className="p-6 rounded-[var(--radius-xl)] bg-[var(--muted)]">
        {/* avatar */}
        <div className="flex justify-center mb-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="token" className="w-[100px] h-[100px] rounded-full object-cover border border-2 border-[var(--tokens-border)] border-dashed" />
        </div>

        {/* name & ticker */}
        <div className="text-center mb-5">
          <div className="text-[24px] leading-[32px] tracking-[-1px] font-bold text-[var(--pip-primary)]">{ticker}</div>
          <div className="text-[16px] leading-[24px] font-medium text-[var(--tokens-foreground)]">{name}</div>
        </div>

        {/* contract address (shortened display, copy full) */}
        <div className="text-center">
          <CopyText text={contractAddress} className="text-[18px] leading-[24px] font-medium text-[var(--muted-foreground)]" />
        </div>

        {/* divider */}
        <div className="my-5 h-px bg-[var(--tokens-border)]" />

        {/* description */}
        <p className="text-[14px] leading-[20px] text-white/80 text-[var(--muted-foreground)] text-center">{description}</p>

        {/* socials */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-1">
          {(() => {
            const links = [
              website && { label: "Website", href: ensureProtocol(website) },
              twitter && { label: "X", href: ensureProtocol(twitter) },
              youtube && { label: "YouTube", href: ensureProtocol(youtube) },
              tiktok && { label: "TikTok", href: ensureProtocol(tiktok) },
              telegram && { label: "Telegram", href: ensureProtocol(telegram) },
            ].filter(Boolean) as { label: string; href: string }[];
            return links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="h-[32px] min-w-[74px] px-3 rounded-[var(--radius-md)] bg-[var(--tokens-secondary)] text-[var(--tokens-secondary-foreground)] text-[12px] leading-[16px] font-medium inline-flex items-center justify-center"
              >
                {l.label}
              </a>
            ));
          })()}
        </div>
      </div>

      {/* actions row */}
      <div className="flex items-center justify-between gap-1 mt-6 mb-4">
        {contractAddress ? (
          <a
            href={`https://jup.ag/swap?sell=${contractAddress}&buy=So11111111111111111111111111111111111111112`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-grow h-[40px] rounded-[var(--radius-md)] bg-[var(--tokens-secondary)] text-[var(--tokens-secondary-foreground)] text-[14px] leading-[20px] font-medium inline-flex items-center justify-center gap-2"
          >
            Jupiter
            <img src="/external_link.svg" alt="jupiter" className="w-4 h-4" />
          </a>
        ) : (
          <button className="flex-grow h-[40px] rounded-[var(--radius-md)] bg-[var(--tokens-secondary)] text-[var(--tokens-secondary-foreground)] text-[14px] leading-[20px] font-medium inline-flex items-center justify-center gap-2" disabled>
            Jupiter
            <img src="/external_link.svg" alt="jupiter" className="w-4 h-4" />
          </button>
        )}
        {poolAddress && (
          <a
            href={`https://axiom.trade/meme/${poolAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-grow h-[40px] rounded-[var(--radius-md)] bg-[var(--tokens-secondary)] text-[var(--tokens-secondary-foreground)] text-[14px] leading-[20px] font-medium inline-flex items-center justify-center gap-2"
          >
            Axiom
            <img src="/external_link.svg" alt="axiom" className="w-4 h-4" />
          </a>
        )}
        {contractAddress && (
          <a
            href={`https://gmgn.ai/sol/token/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-grow h-[40px] rounded-[var(--radius-md)] bg-[var(--tokens-secondary)] text-[var(--tokens-secondary-foreground)] text-[14px] leading-[20px] font-medium inline-flex items-center justify-center gap-2"
          >
            GMGN
            <img src="/external_link.svg" alt="gmgn" className="w-4 h-4" />
          </a>
        )}
        {poolAddress && (
          <a
            href={`https://photon-sol.tinyastro.io/lp/${poolAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-grow h-[40px] rounded-[var(--radius-md)] bg-[var(--tokens-secondary)] text-[var(--tokens-secondary-foreground)] text-[14px] leading-[20px] font-medium inline-flex items-center justify-center gap-2"
          >
            Photon
            <img src="/external_link.svg" alt="photon" className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* CTA row */}
      <div className="mb-4">
        <Link href="/" onClick={() => { useOverlayStore.getState().resetOverlays(); useTokenCreationFlowStore.getState().reset(); }} className="w-full h-12 rounded-[var(--radius-md)] bg-[var(--pip-primary)] text-[var(--pip-primary-foreground)] text-[16px] leading-[24px] font-medium inline-flex items-center justify-center">Launch another one</Link>
      </div>

      <div>
        <Link href="/my-tokens" className="w-full h-12 rounded-[var(--radius-md)] border border-[var(--tokens-border)] text-[var(--tokens-foreground)] text-[16px] leading-[24px] font-medium inline-flex items-center justify-center">My tokens</Link>
      </div>
    </div>
  );
}
