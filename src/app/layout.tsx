import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist_Mono, Outfit, Bagel_Fat_One } from "next/font/google";
import "./globals.css";
import Background from "@/components/shared/Background";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import MobileFooter from "@/components/shared-mobile/MobileFooter";
import WalletInitializer from "@/components/WalletInitializer";
import BackgroundOverlayHost from "@/components/shared/overlays/BackgroundOverlayHost";
import ToastHost from "@/components/shared/ToastHost";
import ToastDebugInit from "@/hooks/useToastDebug";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const bagel = Bagel_Fat_One({
  variable: "--font-bagel-fat-one",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "pip.fun",
  description: "pip.fun",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href="/home-bg.png" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${outfit.className} ${outfit.variable} ${bagel.variable} ${geistMono.variable} antialiased min-h-dvh flex flex-col`}
      >
        {/** debug toasts via URL params (must be wrapped in Suspense when using useSearchParams) */}
        <Suspense fallback={null}>
          <ToastDebugInit />
        </Suspense>
        <WalletInitializer />
        <Background mobileXPercent={70} />
        <BackgroundOverlayHost />
        <div className="relative z-[100]">
          <Header />
        </div>
        <main id="main-scroll" className="flex-1 flex flex-col items-center justify-center relative overflow-auto">
          <div id="main-overlay-root" className="pointer-events-auto z-[120] max-w-full px-4 md:px-0" />
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </main>
        <ToastHost />
        <div className="hidden md:block relative z-[90]">
          <Footer />
        </div>
        <div className="md:hidden relative z-[90]">
          <MobileFooter />
        </div>
      </body>
    </html>
  );
}
