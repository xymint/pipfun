"use client";

import TokenCreationCardMobile from "./TokenCreationCardMobile";
import LightOverlay from "@/components/shared/overlays/LightOverlay";

export default function HomeMobile() {
  return (
    <>
      <LightOverlay />
      <section className="w-full overflow-hidden px-4">
        <TokenCreationCardMobile />
      </section>
    </>
  );
}
