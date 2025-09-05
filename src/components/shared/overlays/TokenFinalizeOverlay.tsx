import { useEffect, useMemo, useRef, useState } from "react";
import OverlayPortal from "@/components/shared/overlays/OverlayPortal";
import { useOverlayStore } from "@/store/overlayStore";
import { fetchWithAuth } from "@/utils/api.util";
import { TOKEN_ENDPOINTS } from "@/constants/apiEndpoints";
import CopyText from "@/utils/CopyText";
import TokenDetail from "@/components/shared/overlays/TokenDetail";
import { useTokenCreationFlowStore } from "@/store/tokenCreationFlowStore";

export default function TokenFinalizeOverlay({ status, tokenId }: { status: "MINTED" | "FAILED"; tokenId?: string }) {
  const setDark = useOverlayStore((s) => s.setDark);
  const step = useTokenCreationFlowStore((s) => s.step);
  if (step !== "TOKEN_FINALIZED") return null;
  useEffect(() => {
    setDark();
  }, [setDark]);
  const overlayVersion = useOverlayStore((s) => s.version);
  // Move state changes to an effect; avoid setState during render (React warning)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const isSuccess = status === "MINTED";
  const tokenIdSafe = tokenId || "";

  const [name, setName] = useState<string>("CAT");
  const [ticker, setTicker] = useState<string>("CAT");
  const [imageUrl, setImageUrl] = useState<string>("/no-tokens.png");
  const [description, setDescription] = useState<string>(
    "Dedicated to the ancient art of making random noises with your mouth, this cryptocurrency will make you LOL and possibly spit out your coffee."
  );
  const [contractAddress, setContractAddress] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [youtube, setYoutube] = useState<string>("");
  const [tiktok, setTiktok] = useState<string>("");
  const [telegram, setTelegram] = useState<string>("");
  const [dbcPoolAddress, setDbcPoolAddress] = useState<string>("");
  const [dammV2PoolAddress, setDammV2PoolAddress] = useState<string>("");

  // launched hero video handling
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = heroVideoRef.current;
    if (!v) return;
    v.muted = true;
    v.playsInline = true as any;
    const tryPlay = () => v.play().catch(() => {});
    const onLoaded = () => tryPlay();
    const onCanPlay = () => tryPlay();
    v.addEventListener("loadeddata", onLoaded);
    v.addEventListener("canplay", onCanPlay);
    tryPlay();
    return () => {
      v.removeEventListener("loadeddata", onLoaded);
      v.removeEventListener("canplay", onCanPlay);
      v.pause();
    };
  }, []);

  useEffect(() => {
    let aborted = false;
    const load = async () => {
      if (!tokenIdSafe) return;
      try {
        const res = await fetchWithAuth(TOKEN_ENDPOINTS.GET_TOKEN_DETAIL(tokenIdSafe));
        if (!res.ok) return;
        const data = await res.json();
        if (aborted || !data) return;
        setName(data.name || name);
        setTicker(data.ticker || ticker);
        setImageUrl(data.imageUrl || imageUrl);
        setDescription(data.description || description);
        setContractAddress(data.contractAddress || "");
        setWebsite(data.website || "");
        setTwitter(data.twitter || "");
        setYoutube(data.youtube || "");
        setTiktok(data.tiktok || "");
        setTelegram(data.telegram || "");
        setDbcPoolAddress(data.dbcPoolAddress || "");
        setDammV2PoolAddress(data.dammV2PoolAddress || "");
      } catch {}
    };
    load();
    return () => {
      aborted = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenIdSafe]);
  return (
    <OverlayPortal>
      <div key={overlayVersion} className="relative z-[80] flex items-start justify-center pt-[24px] md:pt-[32px] text-white mb-[120px]">
        <div className="flex flex-col items-center max-w-full">
          {/* Top hero video */}
          <video
            ref={heroVideoRef}
            src="https://still-bird-8438.t3.storage.dev/pf/pf_launched-token.mp4"
            className="w-[200px] h-[200px] object-cover rounded-[var(--radius-xl)]"
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            controls={false}
            disablePictureInPicture
            poster="/launched.png"
          />
          {/* Title */}
          <div className="[font-family:var(--font-bagel-fat-one)] text-[24px] leading-[24px] mt-[19px] mb-[24px]">
            {isSuccess ? "YAY! LAUNCHED A TOKEN" : "LAUNCH FAILED"}
          </div>

          {/* Detail Card */}
          <TokenDetail
            imageUrl={imageUrl}
            ticker={ticker}
            name={name}
            contractAddress={contractAddress}
            description={description}
            website={website}
            twitter={twitter}
            youtube={youtube}
            tiktok={tiktok}
            telegram={telegram}
            dbcPoolAddress={dbcPoolAddress}
            dammV2PoolAddress={dammV2PoolAddress}
          />
        </div>
      </div>
    </OverlayPortal>
  );
}
