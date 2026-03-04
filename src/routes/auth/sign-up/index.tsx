import { useState, type FormEvent } from 'react'
import { Link, createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/auth/sign-up/')({
  beforeLoad: async () => {
    const session = await authClient.getSession()

    if (session.data) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: SignUpPage,
})

function SignUpPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const result = await authClient.signUp.email({
      name,
      email,
      password,
    })

    setIsLoading(false)

    if (result.error) {
      setError(result.error.message ?? 'Failed to create account')
      return
    }

    await navigate({ to: '/dashboard' })
  }

  return (
    <IosAppShell title="Create account" subtitle="Start securely" activeTab="home">
      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">Sign up</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={onSubmit}>
            <input
              className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <button type="submit" className="ios-primary-action" disabled={isLoading}>
              {isLoading ? 'Creating…' : 'Create account'}
            </button>
          </form>

          <div className="mt-4">
            <Link to="/auth/sign-in" className="ios-secondary-action block text-center">
              Already have an account? Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </IosAppShell>
  )
}
