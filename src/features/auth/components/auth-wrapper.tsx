import { useEffect, type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Spinner } from '@/components/ui/spinner'
import { useCurrentUserQuery } from '@/features/auth/api/use-current-user-query'
import { m } from '@/paraglide/messages.js'

export function AuthWrapper({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { data: user, isLoading } = useCurrentUserQuery()

  useEffect(() => {
    if (!isLoading && user === null) {
      void navigate({ to: '/auth/sign-in' })
    }
  }, [isLoading, user, navigate])

  if (isLoading || typeof user === 'undefined') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-600">
        <Spinner className="mr-2" /> {m.auth_checking_session()}
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
