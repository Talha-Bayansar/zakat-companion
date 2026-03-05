import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-out outline-none select-none active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-3 focus-visible:ring-ring/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.22)] hover:brightness-95",
        outline:
          "border-slate-200/90 bg-white/95 text-slate-900 shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:bg-white",
        secondary:
          "border-slate-200/90 bg-white/95 text-slate-900 shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:bg-slate-50",
        ghost: "bg-transparent text-slate-700 hover:bg-slate-100/80",
        destructive:
          "bg-rose-600 text-white shadow-[0_10px_24px_rgba(190,24,93,0.28)] hover:bg-rose-700",
        link: "h-auto rounded-none px-0 py-0 text-slate-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-12 gap-1.5",
        xs: "min-h-8 rounded-xl px-3 text-xs",
        sm: "min-h-10 rounded-xl px-3.5",
        lg: "min-h-13 gap-2 px-5 text-base",
        icon: "size-12",
        "icon-xs": "size-8 rounded-xl",
        "icon-sm": "size-10 rounded-xl",
        "icon-lg": "size-13",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
    loadingText?: string
    spinnerClassName?: string
  }

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  loadingText,
  spinnerClassName,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Spinner className={spinnerClassName} />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        children
      )}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
