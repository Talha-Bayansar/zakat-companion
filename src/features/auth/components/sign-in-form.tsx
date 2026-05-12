import { GoogleAuthAction } from "./google-auth-action"

type SignInFormProps = {
  redirectTo?: string
}

export function SignInForm({ redirectTo }: SignInFormProps) {
  return <GoogleAuthAction redirectTo={redirectTo} />
}
