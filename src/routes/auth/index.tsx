export default function AuthLandingPage() {
  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '2rem' }}>
      <h1>Authentication</h1>
      <p>Temporary auth landing page. Wiring will be added next.</p>
      <nav style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
        <a href="/auth/sign-in">Go to Sign in</a>
        <a href="/auth/sign-up">Go to Sign up</a>
        <a href="/">Back to Home</a>
      </nav>
    </main>
  )
}
