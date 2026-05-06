import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { redirect } from '@tanstack/react-router'
import { auth } from './server-auth'

export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()

  return auth.api.getSession({
    headers: request.headers,
  })
})

export const requireSession = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await getSession()

  if (!session) {
    throw redirect({ to: '/sign-in' })
  }

  return session
})
