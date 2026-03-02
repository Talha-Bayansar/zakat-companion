import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem' }}>
      <h1>Zakat Companion</h1>
      <p>Track nisab, hawl, and reminders in one place.</p>

      <section style={{ marginTop: '1.25rem' }}>
        <h2>Get started</h2>
        <nav style={{ display: 'grid', gap: '0.75rem' }}>
          <Link to="/auth">Authentication</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/onboarding">Onboarding</Link>
        </nav>
      </section>
    </main>
  )
}
