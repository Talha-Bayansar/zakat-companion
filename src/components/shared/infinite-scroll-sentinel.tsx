import { useEffect, useRef } from 'react'

type InfiniteScrollSentinelProps = {
  onIntersect: () => void
  disabled?: boolean
  rootMargin?: string
}

export function InfiniteScrollSentinel({ onIntersect, disabled = false, rootMargin = '220px' }: InfiniteScrollSentinelProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (disabled || !ref.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersect()
      },
      { rootMargin },
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [disabled, onIntersect, rootMargin])

  return <div ref={ref} className="h-1 w-full" aria-hidden />
}
