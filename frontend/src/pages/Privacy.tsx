export function Privacy() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 space-y-6 leading-relaxed">
      <header>
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted text-sm">Last updated: April 17, 2026</p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-2">1. Who we are</h2>
        <p>
          ft_transcendence is a student project developed as part of the 42 curriculum.
          This service is provided for educational purposes and is not a commercial platform.
          This policy explains what data we collect, why we collect it, and how we use it.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">2. What data we collect</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Account data</strong>: the email address, username, and hashed password you provide at registration.</li>
          <li><strong>Authentication data</strong>: session tokens stored in a secure cookie to keep you logged in. Tokens are stored hashed on our server.</li>
          <li><strong>Gameplay data</strong>: match history, scores, and game statistics required for the product's core features (leaderboards, profile).</li>
          <li><strong>Technical data</strong>: minimal server logs (IP address, timestamps, user-agent) used to debug and protect against abuse.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">3. Why we use your data</h2>
        <p>
          We use the data strictly to operate the service: authenticating you, displaying
          your profile, matching you with opponents, and maintaining service security.
          We do not sell your data and we do not use it for advertising.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">4. How we store your data</h2>
        <p>
          Your password is never stored in clear text. We hash it with argon2id, an industry
          standard algorithm. Data is stored in a PostgreSQL database accessible only to the
          application. Traffic between your browser and our servers is encrypted using HTTPS.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">5. Your rights</h2>
        <p>
          Under the GDPR, you can request access to the personal data we hold about you,
          request its correction, and ask for its deletion. To exercise these rights, contact
          the project owners. Deleting your account removes your profile data and invalidates
          all active sessions.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">6. Cookies</h2>
        <p>
          We use a single essential cookie (<code>session_token</code>) to maintain your
          authenticated session. This cookie is HTTP-only, secure, and SameSite=strict.
          We do not use analytics, advertising, or third-party tracking cookies.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">7. Changes to this policy</h2>
        <p>
          As this is an evolving student project, this policy may be updated. We will update
          the "Last updated" date when changes are made.
        </p>
      </section>
    </article>
  );
}