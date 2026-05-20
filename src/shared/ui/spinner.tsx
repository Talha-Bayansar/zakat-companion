import { m } from "@/paraglide/messages"
import { cn } from "@/shared/lib/cn"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

type SpinnerProps = Omit<React.ComponentProps<"svg">, "size" | "strokeWidth"> & {
  label?: string
}

function Spinner({ className, label = m.common_loading(), ...props }: SpinnerProps) {
  return (
    <HugeiconsIcon
      icon={Loading03Icon}
      strokeWidth={2}
      role="status"
      aria-label={label}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
