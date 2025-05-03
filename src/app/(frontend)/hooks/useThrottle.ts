import { useRef, useCallback } from 'react'

/**
 * useThrottle - Returns a throttled version of a callback that only runs at most once every `delay` ms.
 * @param callback The function to throttle
 * @param delay The throttle delay in ms
 */
export function useThrottle<T extends (...args: any[]) => void>(callback: T, delay: number): T {
  const lastCall = useRef(0)
  const savedCallback = useRef(callback)

  // Always keep the latest callback
  savedCallback.current = callback

  return useCallback(
    (...args: any[]) => {
      const now = Date.now()
      if (now - lastCall.current >= delay) {
        lastCall.current = now
        savedCallback.current(...args)
      }
    },
    [delay],
  ) as T
}
