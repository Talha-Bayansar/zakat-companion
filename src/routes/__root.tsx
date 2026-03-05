import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { AppProviders } from '@/app/providers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import '@/app/styles/index.css'

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: RootError,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Zakat Companion</title>
        <HeadContent />
      </head>
      <body>
        <AppProviders>
          <Outlet />
        </AppProviders>
        <Scripts />
      </body>
    </html>
  )
}

function RootError() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Something went wrong · Zakat Companion</title>
        <HeadContent />
      </head>
      <body>
        <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
          <Card className="ios-surface w-full">
            <CardHeader>
              <CardTitle className="ios-section-title">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="ios-copy-muted">Please refresh the page. If this continues, sign in again.</p>
              <Button type="button" className="w-full" onClick={() => window.location.reload()}>
                Refresh page
              </Button>
              <Link to="/" className="ios-secondary-action w-full text-center">
                Go to home
              </Link>
            </CardContent>
          </Card>
        </main>
        <Scripts />
      </body>
    </html>
  )
}
