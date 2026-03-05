import { useEffect, type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Spinner } from '@/components/ui/spinner'
import { useCurrentUserQuery } from '@/features/auth/api/use-current-user-query'

export function AuthWrapper({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { data: user, isLoading, isFetching } = useCurrentUserQuery()

  useEffect(() => {
    if (!isLoading && !isFetching && !user) {
      void navigate({ to: '/auth/sign-in' })
    }
  }, [isLoading, isFetching, user, navigate])

  if (isLoading || isFetching || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-600">
        <Spinner className="mr-2" /> Checking session...
      </div>
    )
  }

  return <>{children}</>
}
