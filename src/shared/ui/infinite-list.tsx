import { useEffect, useRef } from "react"
import type { Key, ReactNode } from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/shared/lib/cn"
import { Button } from "@/shared/ui/button"
import { Spinner } from "@/shared/ui/spinner"

type InfiniteListProps<TItem> = {
  items: readonly TItem[]
  hasMore: boolean
  isLoading: boolean
  isFetchingNextPage: boolean
  isRefreshing?: boolean
  onLoadMore: () => void
  renderItem: (item: TItem, index: number) => ReactNode
  getItemKey: (item: TItem, index: number) => Key
  loadingState?: ReactNode
  refreshState?: ReactNode
  emptyState?: ReactNode
  endState?: ReactNode
  loadMoreLabel: ReactNode
  loadingLabel: string
  className?: string
  listClassName?: string
  footerClassName?: string
  autoLoad?: boolean
  observeRoot?: Element | null
  rootMargin?: string
}

function InfiniteList<TItem>({
  items,
  hasMore,
  isLoading,
  isFetchingNextPage,
  isRefreshing = false,
  onLoadMore,
  renderItem,
  getItemKey,
  loadingState,
  refreshState,
  emptyState,
  endState,
  loadMoreLabel,
  loadingLabel,
  className,
  listClassName,
  footerClassName,
  autoLoad = true,
  observeRoot = null,
  rootMargin = "400px",
}: InfiniteListProps<TItem>) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current

    if (!autoLoad || !hasMore || !sentinel || isLoading || isFetchingNextPage) {
      return
    }

    if (typeof IntersectionObserver === "undefined") {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isLoading && !isFetchingNextPage) {
          onLoadMore()
        }
      },
      {
        root: observeRoot,
        rootMargin,
        threshold: 0.1,
      },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [
    autoLoad,
    hasMore,
    isLoading,
    isFetchingNextPage,
    onLoadMore,
    observeRoot,
    rootMargin,
  ])

  if (isLoading && items.length === 0) {
    return loadingState ? <>{loadingState}</> : null
  }

  if (items.length === 0) {
    return emptyState ? <>{emptyState}</> : null
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {isRefreshing && refreshState ? <>{refreshState}</> : null}

      <div className={cn("flex flex-col gap-2", listClassName)}>
        {items.map((item, index) => (
          <div key={getItemKey(item, index)}>{renderItem(item, index)}</div>
        ))}
      </div>

      {hasMore || endState ? (
        <div className={cn("flex flex-col gap-2", footerClassName)}>
          <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

          {hasMore ? (
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center"
              onClick={onLoadMore}
              disabled={isLoading || isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <Spinner label={loadingLabel} className="size-4" />
              ) : (
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
              )}
              <span>{loadMoreLabel}</span>
            </Button>
          ) : endState ? (
            <>{endState}</>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export { InfiniteList }
