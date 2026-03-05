import { useEffect, useRef } from 'react'

type InfiniteScrollSentinelProps = {
  onIntersect: () => void
  disabled?: boolean
  rootMargin?: string
}

export function InfiniteScrollSentinel({
  onIntersect,
  disabled = false,
  rootMargin = '240px',
}: InfiniteScrollSentinelProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (disabled || !ref.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) onIntersect()
      },
      { rootMargin },
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [disabled, onIntersect, rootMargin])

  return <div ref={ref} aria-hidden className="h-1 w-full" />
}
