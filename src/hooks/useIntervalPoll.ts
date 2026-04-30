import { useEffect, useRef } from 'react'

/**
 * Runs `fn` on an interval while the document is visible.
 * Refetches immediately when the user returns to the tab.
 */
export function useIntervalPoll(fn: () => void, intervalMs: number | null | undefined) {
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    if (intervalMs == null || intervalMs <= 0) return

    const tick = () => {
      if (document.visibilityState === 'visible') fnRef.current()
    }

    const id = window.setInterval(tick, intervalMs)

    const onVisibility = () => {
      if (document.visibilityState === 'visible') tick()
    }

    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [intervalMs])
}
