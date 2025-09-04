export default function PrivacyPage() {
  return (
    <div className="flex-grow w-full flex justify-center mt-[24px] md:mt-[32px] mb-[120px] px-4 md:px-0 relative z-[100]">
      <article className="w-full max-w-[800px] text-[var(--tokens-foreground)]">
        <h1 className="text-white text-[20px] leading-[28px] font-semibold mb-4">Privacy Policy</h1>

        <p className="text-[16px] leading-[24px] mb-6">
          At pip.fun, your privacy matters to us. This Privacy Policy explains how we collect, use, store, and protect your
          personal information when you access or use our website or services. By using pip.fun, you agree to the terms
          outlined in this Policy.
        </p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mb-2">1. Information We Collect</h3>
        <p className="text-[16px] leading-[24px] mb-2">We collect two types of information:</p>
        <p className="text-[16px] leading-[24px] font-semibold mb-1">a. Information you provide directly</p>
        <p className="text-[16px] leading-[24px] mb-2">Username, wallet address, or other identifiers (for activity tracking or project participation)</p>
        <p className="text-[16px] leading-[24px] font-semibold mb-1">b. Information collected automatically</p>
        <ul className="list-disc pl-5 text-[16px] leading-[24px] space-y-1">
          <li>Device and browser details</li>
          <li>IP address and approximate location</li>
          <li>Pages visited and session activity</li>
          <li>Cookies or similar tracking technologies</li>
        </ul>
        <p className="text-[16px] leading-[24px] mt-2 mb-6">
          Important: We do not collect, request, or store your private keys, seed phrases, or any information that gives access
          to your funds.
        </p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mb-2">2. How We Use Your Information</h3>
        <p className="text-[16px] leading-[24px] mb-2">We may use the information collected to:</p>
        <ul className="list-disc pl-5 text-[16px] leading-[24px] space-y-1">
          <li>Provide and improve Platform functionality</li>
          <li>Monitor activity and detect fraud or abuse</li>
          <li>Respond to legal or regulatory requests</li>
          <li>Communicate updates, changes, or support notices</li>
          <li>Enforce our Terms of Use and other Platform policies</li>
        </ul>
        <p className="text-[16px] leading-[24px] mt-2 mb-6">
          Note: We do not sell or rent your personal information to third parties.
        </p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mb-2">3. Cookies and Tracking</h3>
        <p className="text-[16px] leading-[24px] mb-2">The Platform uses cookies and similar technologies to:</p>
        <ul className="list-disc pl-5 text-[16px] leading-[24px] space-y-1">
          <li>Store your preferences</li>
          <li>Analyze how users interact with the site</li>
          <li>Monitor system performance and prevent abuse</li>
        </ul>
        <p className="text-[16px] leading-[24px] mt-2 mb-6">
          You can manage or disable cookies in your browser settings.
        </p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mb-2">4. Sharing of Information</h3>
        <p className="text-[16px] leading-[24px] mb-2">We may share your data only under the following circumstances:</p>
        <ul className="list-disc pl-5 text-[16px] leading-[24px] space-y-1">
          <li>With trusted service providers (e.g., analytics, hosting, or infrastructure partners)</li>
          <li>In response to valid legal obligations (e.g., subpoenas or court orders)</li>
          <li>To detect, prevent, or address fraud, abuse, or security risks</li>
          <li>With your explicit consent</li>
        </ul>
        <p className="text-[16px] leading-[24px] mt-2 mb-6">We do not share your data with third parties for advertising or marketing purposes.</p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mb-2">5. Data Retention</h3>
        <p className="text-[16px] leading-[24px] mb-6">
          We retain personal information only as long as necessary to fulfill the purposes described in this Policy or as required
          by law. Certain anonymized, wallet-based activity logs may be stored indefinitely for system integrity and auditing
          purposes.
        </p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mb-2">6. Security</h3>
        <p className="text-[16px] leading-[24px] mb-2">We apply commercially reasonable measures to safeguard your data, including:</p>
        <ul className="list-disc pl-5 text-[16px] leading-[24px] space-y-1">
          <li>SSL encryption during data transmission</li>
          <li>Access control and security monitoring</li>
          <li>Regular audits and system updates</li>
        </ul>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mt-6 mb-2">7. Your Rights</h3>
        <p className="text-[16px] leading-[24px] mb-2">
          Depending on your jurisdiction (e.g., EU GDPR, California CCPA), you may have rights to:
        </p>
        <ul className="list-disc pl-5 text-[16px] leading-[24px] space-y-1">
          <li>Access and review your personal data</li>
          <li>Request correction or deletion</li>
          <li>Object to or restrict processing</li>
          <li>Withdraw consent at any time</li>
          <li>File a complaint with a data protection authority</li>
        </ul>
        <p className="text-[16px] leading-[24px] mt-2 mb-6">To exercise your rights, please contact us at hello@getpip.com</p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mb-2">8. Children’s Privacy</h3>
        <p className="text-[16px] leading-[24px] mb-6">
          The Platform is not designed for individuals under 18 years of age. We do not knowingly collect data from minors. If we
          discover such information, we will take steps to promptly delete it.
        </p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mb-2">9. Changes to This Policy</h3>
        <p className="text-[16px] leading-[24px] mb-6">
          We may update this Privacy Policy from time to time. When updates occur, we will revise the “Last Updated” date at the
          top of this page. Continued use of the Platform after updates means you accept the revised Policy.
        </p>

        <h3 className="text-white text-[16px] leading-[24px] font-semibold mb-2">10. Contact Us</h3>
        <p className="text-[16px] leading-[24px]">
          If you have questions, concerns, or requests regarding this Privacy Policy, please reach us at: hello@getpip.com
        </p>
      </article>
    </div>
  );
}
