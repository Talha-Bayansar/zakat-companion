import { useState } from "react"

import { m } from "@/paraglide/messages"
import { Button } from "@/shared/ui/button"
import { Spinner } from "@/shared/ui/spinner"

import { useGoogleSignInMutation } from "../lib/auth.mutations"

type GoogleAuthActionProps = {
  redirectTo?: string
}

export function GoogleAuthAction({ redirectTo }: GoogleAuthActionProps) {
  const googleSignInMutation = useGoogleSignInMutation()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setSubmitError(null)

    try {
      await googleSignInMutation.mutateAsync(redirectTo)
    } catch {
      setSubmitError(m.auth_google_sign_in_error())
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {submitError ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
          {submitError}
        </p>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="h-12 w-full justify-start gap-3 rounded-2xl px-4"
        disabled={googleSignInMutation.isPending}
        onClick={() => void handleGoogleSignIn()}
      >
        {googleSignInMutation.isPending ? (
          <>
            <Spinner label={m.auth_connecting_with_google()} className="size-4" />
            <span>{m.auth_connecting_with_google()}</span>
          </>
        ) : (
          <>
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
              G
            </span>
            <span>{m.auth_continue_with_google()}</span>
          </>
        )}
      </Button>
    </div>
  )
}
