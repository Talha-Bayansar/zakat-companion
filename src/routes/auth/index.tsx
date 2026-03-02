import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/')({
  component: AuthLandingPage,
})

function AuthLandingPage() {
  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '2rem' }}>
      <h1>Authentication</h1>
      <p>Temporary auth landing page. Wiring will be added next.</p>
      <nav style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
        <Link to="/auth/sign-in">Go to Sign in</Link>
        <Link to="/auth/sign-up">Go to Sign up</Link>
        <Link to="/">Back to Home</Link>
      </nav>
    </main>
  )
}
