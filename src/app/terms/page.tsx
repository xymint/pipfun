export default function TermsPage() {
  return (
    <div className="flex-grow w-full flex justify-center mt-[24px] md:mt-[32px] mb-[120px] px-4 md:px-0 relative z-[100]">
      <article className="w-full max-w-[800px] text-[var(--tokens-foreground)]">
        <h1 className="text-white text-[20px] leading-[28px] font-semibold mb-4">Terms of Use</h1>

        <h2 className="text-white text-[16px] leading-[24px] font-semibold mb-2">PIP.FUN Platform Terms and Conditions</h2>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mb-2">Introduction</h3>
        <p className="text-[16px] leading-[24px]">
          Welcome to pip.fun (hereinafter referred to as “the Platform”). Before using the services provided by the Platform,
          please carefully read and understand the following Terms of Use (hereinafter referred to as “Terms”). By accessing or
          using this Platform, you acknowledge that you have read, understood, and agreed to be bound by these Terms.
        </p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mt-6 mb-2">1. Platform Services</h3>
        <p className="text-[16px] leading-[24px] mb-2">
          The Platform provides services related to the launch and management of tokens on the Solana blockchain. These
          services may include, but are not limited to:
        </p>
        <ul className="list-disc pl-5 text-[16px] leading-[24px] space-y-1">
          <li>Token creation and deployment</li>
          <li>Participation in token sales or launches</li>
          <li>Transaction execution and settlement</li>
          <li>Access to token-related information and analytics</li>
        </ul>
        <p className="text-[16px] leading-[24px] mt-2">
          The Platform acts as a technology provider and does not guarantee the success, security, or legality of any project
          launched through it.
        </p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mt-6 mb-2">2. Eligibility</h3>
        <p className="text-[16px] leading-[24px] mb-2">To use the Platform, you must:</p>
        <ul className="list-disc pl-5 text-[16px] leading-[24px] space-y-1">
          <li>Be at least 18 years of age (or the legal age of majority in your jurisdiction), or</li>
          <li>Be a legally registered entity authorized to conduct business.</li>
        </ul>
        <p className="text-[16px] leading-[24px] mt-2">
          By using the Platform, you represent and warrant that you meet the above criteria.
        </p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mt-6 mb-2">3. User Conduct</h3>
        <p className="text-[16px] leading-[24px] mb-2">
          When using the Platform, you agree to comply with all applicable laws, regulations, and rules. Prohibited activities
          include, but are not limited to:
        </p>
        <ul className="list-disc pl-5 text-[16px] leading-[24px] space-y-1">
          <li>Engaging in money laundering, fraud, or terrorist financing</li>
          <li>Infringing on intellectual property rights of others</li>
          <li>Uploading or distributing illegal, harmful, or misleading content</li>
          <li>Attempting to interfere with the security or functionality of the Platform</li>
        </ul>
        <p className="text-[16px] leading-[24px] mt-2">
          Any violation of this section may result in suspension or termination of your access to the Platform.
        </p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mt-6 mb-2">4. Intellectual Property</h3>
        <p className="text-[16px] leading-[24px]">
          All content on the Platform—including text, graphics, software, trademarks, and other materials—is the property of
          pip.fun or its licensors. Unless expressly authorized in writing by the Platform, you may not copy, reproduce, modify,
          distribute, or use such content for commercial purposes.
        </p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mt-6 mb-2">5. Limitation of Liability</h3>
        <p className="text-[16px] leading-[24px] mb-2">The Platform is provided on an “as is” and “as available” basis. To the fullest extent permitted by law:</p>
        <ul className="list-disc pl-5 text-[16px] leading-[24px] space-y-1">
          <li>The Platform and its affiliates disclaim all warranties, express or implied.</li>
          <li>
            The Platform shall not be liable for any indirect, incidental, special, or consequential damages, including but not
            limited to financial losses, data loss, or reputational harm.
          </li>
        </ul>
        <p className="text-[16px] leading-[24px] mt-2">
          You agree to indemnify and hold harmless the Platform and its affiliates from any claims, damages, or expenses arising
          from your use of the Platform, your violation of these Terms, or any infringement of third-party rights.
        </p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mt-6 mb-2">6. Amendments to the Terms</h3>
        <p className="text-[16px] leading-[24px]">
          The Platform reserves the right to modify or update these Terms at any time. Updates will be posted on the Platform and
          will become effective immediately upon posting. Continued use of the Platform following such changes constitutes your
          acceptance of the revised Terms.
        </p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mt-6 mb-2">7. Contact Information</h3>
        <p className="text-[16px] leading-[24px]">
          If you have any questions regarding these Terms or the services of the Platform, please contact us via
          hello@getpip.com.
        </p>
      </article>
    </div>
  );
}
