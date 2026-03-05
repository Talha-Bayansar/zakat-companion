import * as React from 'react'
import { cn } from '@/lib/utils'

function Item({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="item" className={cn('flex items-center justify-between gap-3 py-3', className)} {...props} />
}

function ItemContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="item-content" className={cn('min-w-0', className)} {...props} />
}

function ItemTitle({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="item-title" className={cn('truncate text-sm font-semibold text-slate-900', className)} {...props} />
}

function ItemDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="item-description" className={cn('text-xs text-slate-600', className)} {...props} />
}

export { Item, ItemContent, ItemTitle, ItemDescription }
