export default function FeesPage() {
  return (
    <div className="flex-grow w-full flex justify-center mt-[24px] md:mt-[32px] mb-[120px] px-4 md:px-0 relative z-[100]">
      <article className="w-full max-w-[800px] text-[var(--tokens-foreground)]">
        <h1 className="text-white text-[20px] leading-[28px] font-semibold mb-4">Fees &amp; Revenue Streams</h1>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mb-2">1. Token Creation Fee</h3>
        <p className="text-[16px] leading-[24px] mb-2">
          To launch a new token on pip.fun, a one-time fee of 0.038 SOL is required.
        </p>
        <p className="text-[16px] leading-[24px] mb-6">
          This fee covers the necessary on-chain account creation, contract deployment, and setup processes.
        </p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mb-2">2. Pre-Migration Trading Fees</h3>
        <ul className="list-disc pl-5 text-[16px] leading-[24px] space-y-1 mb-6">
          <li>Before a token migrates into a liquidity pool, all trades are subject to a 1% trading fee.</li>
          <li>70% of these fees are distributed to token creators, giving them a direct incentive to build active trading communities around their projects.</li>
          <li>The remaining portion supports platform operations and ecosystem growth.</li>
        </ul>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mb-2">3. Post-Migration Trading Fees (DAMM v2 Pool)</h3>
        <ul className="list-disc pl-5 text-[16px] leading-[24px] space-y-1 mb-6">
          <li>After migration to a Dynamic Automated Market Maker (DAMM) v2 pool, the trading fee remains at 1%.</li>
          <li>As with pre-migration, 70% of these fees go to token creators.</li>
          <li>This ensures creators benefit from long-term trading activity tied to their tokens.</li>
        </ul>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mb-2">4. Summary of Fee Distribution</h3>
        <ul className="list-disc pl-5 text-[16px] leading-[24px] space-y-1 mb-6">
          <li>Token creation fee: 0.038 SOL (one-time)</li>
          <li>Trading fees: 1% per trade (70% to creators, 30% to platform &amp; ecosystem)</li>
        </ul>

        <p className="text-[16px] leading-[24px]">For more details or inquiries, please contact us at hello@getpip.com</p>
      </article>
    </div>
  );
}
