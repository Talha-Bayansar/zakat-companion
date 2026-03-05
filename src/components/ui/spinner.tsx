import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'

import { cn } from '@/lib/utils'

function Spinner({ className }: { className?: string }) {
  return <HugeiconsIcon icon={Loading03Icon} strokeWidth={2.2} className={cn('size-4 animate-spin', className)} aria-hidden />
}

export { Spinner }
