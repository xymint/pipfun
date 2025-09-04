export default function ContentIpPage() {
  return (
    <div className="flex-grow w-full flex justify-center mt-[24px] md:mt-[32px] mb-[120px] px-4 md:px-0 relative z-[100]">
      <article className="w-full max-w-[800px] text-[var(--tokens-foreground)]">
        <h1 className="text-white text-[20px] leading-[28px] font-semibold mb-4">Content Responsibility &amp; IP Guidelines</h1>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mb-2">User-Generated Content</h3>
        <p className="text-[16px] leading-[24px] mb-6">
          pip.fun allows users to launch tokens, including meme coins, using content sourced from publicly accessible URLs or
          uploaded materials. While this is a powerful tool, we strongly encourage users to create original content or obtain the
          necessary permissions before using third-party materials in connection with their tokens.
        </p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mb-2">User Confirmations</h3>
        <p className="text-[16px] leading-[24px] mb-2">By creating or sharing tokens on pip.fun, you confirm that:</p>
        <ul className="list-disc pl-5 text-[16px] leading-[24px] space-y-1">
          <li>You have the legal right to use the underlying content (including text, images, videos, logos, or likenesses).</li>
          <li>Your content does not infringe upon intellectual property rights, publicity rights, or any other legal rights of third parties.</li>
          <li>You are solely responsible for the legality of the content you use and accept all consequences that may result.</li>
        </ul>
        <p className="text-[16px] leading-[24px] mt-2 mb-6">
          Disclaimer: pip.fun does not moderate, screen, or review token content for copyright, trademark, or other rights
          compliance. The Platform disclaims all liability for unauthorized use of third-party content. If a rights holder believes
          their intellectual property has been misused, they should contact the token creator directly or report the matter as
          outlined in our policies.
        </p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mb-2">Platform Role &amp; Legal Jurisdiction</h3>
        <ul className="list-disc pl-5 text-[16px] leading-[24px] space-y-1 mb-2">
          <li>pip.fun is a neutral technology platform that enables user-driven token creation on the Solana blockchain.</li>
          <li>The Platform is not a broker, financial advisor, exchange, or publisher.</li>
          <li>All interactions take place directly between users and the blockchain network.</li>
        </ul>
        <p className="text-[16px] leading-[24px] mb-2">
          Users are solely responsible for complying with the laws and regulations in their jurisdiction, including but not limited
          to those concerning digital assets, securities, intellectual property, and financial services.
        </p>
        <p className="text-[16px] leading-[24px] mb-6">
          pip.fun reserves the right, at its sole discretion, to remove or restrict access to any content that violates its Terms of
          Use, Trademark Policy, or applicable law. However, the Platform does not mediate or resolve legal disputes between users
          and third parties.
        </p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mb-2">No Token Guarantees</h3>
        <p className="text-[16px] leading-[24px] mb-2">Tokens created on pip.fun:</p>
        <ul className="list-disc pl-5 text-[16px] leading-[24px] space-y-1">
          <li>Have no inherent or guaranteed value, utility, or functionality.</li>
          <li>May be experimental, humorous, or purely symbolic.</li>
          <li>Are not guaranteed to have liquidity, stability, usefulness, or continued support from their creators.</li>
        </ul>
        <p className="text-[16px] leading-[24px] mt-2 mb-6">
          pip.fun provides only the launchpad technology and does not endorse, back, or guarantee any project created through the
          Platform.
        </p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mb-2">Final Agreement</h3>
        <p className="text-[16px] leading-[24px] mb-6">
          By using pip.fun, you acknowledge and agree to all of the above. If you do not agree with these guidelines, you should
          refrain from using the Platform or its services.
        </p>

        <p className="text-[16px] leading-[24px]">For questions or concerns, please contact us at hello@getpip.com</p>
      </article>
    </div>
  );
}
