import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'

export const NativeSelect = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'ios-input w-full appearance-none px-4 pr-11 text-sm text-slate-900 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-slate-500"
        />
      </div>
    )
  },
)

NativeSelect.displayName = 'NativeSelect'
