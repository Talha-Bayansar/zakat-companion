import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { AppProviders } from '@/app/providers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { m } from '@/paraglide/messages.js'
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
        <title>{m.app_name()}</title>
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
        <title>{m.root_error_page_title()}</title>
        <HeadContent />
      </head>
      <body>
        <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
          <Card className="ios-surface w-full">
            <CardHeader>
              <CardTitle className="ios-section-title">{m.root_error_title()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="ios-copy-muted">{m.root_error_desc()}</p>
              <Button type="button" className="w-full" onClick={() => window.location.reload()}>
                {m.root_error_refresh()}
              </Button>
              <Link to="/" className="ios-secondary-action w-full text-center">
                {m.root_error_go_home()}
              </Link>
            </CardContent>
          </Card>
        </main>
        <Scripts />
      </body>
    </html>
  )
}
