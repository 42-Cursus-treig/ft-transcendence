export function Terms() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 space-y-6 leading-relaxed">
      <header>
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted text-sm">Last updated: April 17, 2026</p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-2">1. Acceptance of these terms</h2>
        <p>
          By creating an account or using ft_transcendence, you agree to these Terms of
          Service. If you do not agree, do not use the service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">2. Nature of the service</h2>
        <p>
          ft_transcendence is a non-commercial student project. The service is provided
          "as is" for educational and recreational use. Availability, features, and data
          are not guaranteed, and the service may be interrupted, reset, or discontinued
          at any time without notice.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">3. Your account</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>You must provide accurate information when registering.</li>
          <li>You are responsible for keeping your password secure.</li>
          <li>You must not share your account or use someone else's account.</li>
          <li>One person = one account. Creating multiple accounts to disrupt gameplay is prohibited.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">4. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Exploit bugs, cheat, use bots, or otherwise unfairly gain an advantage.</li>
          <li>Harass, threaten, or send abusive content to other users.</li>
          <li>Attempt to disrupt, overload, or attack the service.</li>
          <li>Upload content that infringes copyrights or violates applicable laws.</li>
          <li>Attempt to bypass security or authentication mechanisms.</li>
        </ul>
        <p className="mt-2">
          We may suspend or terminate accounts that violate these rules.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">5. User-generated content</h2>
        <p>
          You remain the owner of content you create (usernames, messages, etc.) but
          you grant us a license to display and store it as needed to operate the service.
          You are responsible for the content you publish.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">6. Disclaimer of warranties</h2>
        <p>
          The service is provided without warranties of any kind. We do not guarantee that
          the service will be uninterrupted, error-free, or free from security vulnerabilities.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">7. Changes to these terms</h2>
        <p>
          We may update these terms as the project evolves. Continued use of the service
          after changes means you accept the updated terms.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">8. Contact</h2>
        <p>
          For questions about these terms, contact the project owners via the project
          repository.
        </p>
      </section>
    </article>
  );
}