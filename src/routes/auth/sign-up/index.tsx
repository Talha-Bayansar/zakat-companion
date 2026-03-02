import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/sign-up/')({
  component: SignUpPage,
})

function SignUpPage() {
  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '2rem' }}>
      <h1>Sign up</h1>
      <p>Temporary page. Auth integration is not wired yet.</p>
      <Link to="/auth">Back to Auth landing</Link>
    </main>
  )
}
