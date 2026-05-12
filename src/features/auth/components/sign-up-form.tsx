import { GoogleAuthAction } from "./google-auth-action"

type SignUpFormProps = {
  redirectTo?: string
}

export function SignUpForm({ redirectTo }: SignUpFormProps) {
  return <GoogleAuthAction redirectTo={redirectTo} />
}
