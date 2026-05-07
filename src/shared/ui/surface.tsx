import type { HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/cn"

const surfaceVariants = cva(
  "border border-border/70 bg-background/80 text-foreground backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "shadow-[0_1px_0_rgba(15,23,42,0.02)]",
        subtle: "bg-muted/20",
        elevated: "shadow-sm shadow-foreground/5",
        interactive:
          "transition-[transform,box-shadow,border-color,background-color] duration-150 ease-out hover:-translate-y-px hover:border-border hover:bg-background/90 hover:shadow-sm focus-within:border-ring/60 focus-within:shadow-sm",
      },
      rounded: {
        md: "rounded-2xl",
        lg: "rounded-3xl",
        xl: "rounded-[1.75rem]",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-5",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      rounded: "lg",
      padding: "md",
    },
  },
)

function Surface({
  className,
  variant,
  rounded,
  padding,
  ...props
}: HTMLAttributes<HTMLDivElement> & VariantProps<typeof surfaceVariants>) {
  return (
    <div
      className={cn(surfaceVariants({ variant, rounded, padding, className }))}
      {...props}
    />
  )
}

export { Surface, surfaceVariants }
