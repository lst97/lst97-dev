'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

interface TurnstileOptions {
  sitekey: string
  callback: (token: string) => void
  'expired-callback'?: () => void
  action?: string
  [key: string]: unknown
}

declare global {
  interface Window {
    turnstile: {
      render: (container: string | HTMLElement, options: TurnstileOptions) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    _turnstileScriptLoaded?: boolean
    _turnstileWidgetIds?: Map<string, string>
  }
}

interface TurnstileProps {
  siteKey: string
  onVerify: (token: string) => void
  onExpired?: () => void
  action?: string
  headless?: boolean
}

const Turnstile: React.FC<TurnstileProps> = React.memo(
  ({ siteKey, onVerify, onExpired, action = 'contact_form', headless = false }) => {
    const [error, setError] = useState<string | null>(null)
    const [_isLoading, setIsLoading] = useState(true)
    const [_isVerified, setIsVerified] = useState(false)
    const widgetId = useRef<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const onVerifyRef = useRef(onVerify)

    // Keep the onVerify callback up to date without causing re-renders
    useEffect(() => {
      onVerifyRef.current = onVerify
    }, [onVerify])

    // Create a stable ID that doesn't change on re-renders
    const instanceId = useRef<string>(`turnstile-${Math.random().toString(36).substring(2, 9)}`)

    // Function to clean up widget
    const cleanupWidget = useCallback(() => {
      try {
        // Clean up the widget when component unmounts
        if (widgetId.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetId.current)
            window.turnstile.remove(widgetId.current)
            // Remove from global tracking
            if (window._turnstileWidgetIds) {
              window._turnstileWidgetIds.delete(instanceId.current)
            }
          } catch (e) {
            console.error('Error cleaning up Turnstile widget:', e)
          }
          widgetId.current = null
        }
      } catch (error) {
        console.error('Error in Turnstile cleanup:', error)
      }
    }, [])

    // Stable callback for Turnstile verification
    const handleVerify = useCallback((token: string) => {
      onVerifyRef.current(token)
      setIsVerified(true)
      setIsLoading(false)
    }, [])

    // Stable callback for Turnstile expiration
    const handleExpired = useCallback(() => {
      // Reset on expiration
      if (widgetId.current && window.turnstile) {
        window.turnstile.reset(widgetId.current)
        setIsVerified(false)
      }
      // Call the provided onExpired callback if available
      if (onExpired) {
        onExpired()
      }
    }, [onExpired])

    // Initialize global widget tracking if not exists - using a Map for container ID to widget ID mapping
    useEffect(() => {
      if (!window._turnstileWidgetIds) {
        window._turnstileWidgetIds = new Map()
      }

      // Return cleanup function
      return () => {
        cleanupWidget()
      }
    }, [cleanupWidget])

    useEffect(() => {
      if (!siteKey) {
        setError('Turnstile site key is missing')
        setIsLoading(false)
        return
      }

      let isMounted = true

      const renderWidget = () => {
        if (!containerRef.current || !window.turnstile || !isMounted) return

        // Check if we already have a widget for this container
        const existingWidgetId = window._turnstileWidgetIds?.get(instanceId.current)

        // Clean up any existing widget for this container
        if (existingWidgetId) {
          try {
            window.turnstile.reset(existingWidgetId)
            window.turnstile.remove(existingWidgetId)
          } catch (e) {
            console.error('Error cleaning up existing Turnstile widget:', e)
          }
        }

        // Render the Turnstile widget
        widgetId.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            if (!isMounted) return
            handleVerify(token)
          },
          'expired-callback': () => {
            if (!isMounted) return
            handleExpired()
          },
          action: action,
        })

        // Add to global tracking
        if (window._turnstileWidgetIds && widgetId.current) {
          window._turnstileWidgetIds.set(instanceId.current, widgetId.current)
        }
      }

      // Check if the script is already loaded
      if (window.turnstile) {
        renderWidget()
        return cleanupWidget
      }

      // Check if script is already being loaded by another instance
      const existingScript = document.querySelector(
        'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
      )

      if (existingScript) {
        // Script exists but might still be loading
        if (window._turnstileScriptLoaded) {
          renderWidget()
        } else {
          existingScript.addEventListener('load', () => {
            window._turnstileScriptLoaded = true
            renderWidget()
          })
        }
      } else {
        // Load the Turnstile script
        const script = document.createElement('script')
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
        script.async = true
        script.defer = true

        script.onerror = () => {
          if (!isMounted) return
          setError('Failed to load Turnstile')
          setIsLoading(false)
        }

        script.onload = () => {
          window._turnstileScriptLoaded = true
          renderWidget()
        }

        document.body.appendChild(script)
      }

      return () => {
        isMounted = false
        cleanupWidget()
      }
    }, [siteKey, action, handleVerify, handleExpired, cleanupWidget])

    if (error && !headless) {
      return (
        <div
          className="text-red-500 text-center p-4 my-4 bg-red-50 border border-red-200 rounded-md"
          role="alert"
        >
          {error}
        </div>
      )
    }

    if (headless) {
      return (
        <div
          ref={containerRef}
          id={instanceId.current}
          className="flex justify-center items-center w-full my-4"
          data-testid="turnstile-container"
        ></div>
      )
    }

    return (
      <>
        <div
          ref={containerRef}
          id={instanceId.current}
          className="flex justify-center items-center w-full my-4"
          data-testid="turnstile-container"
        ></div>
      </>
    )
  },
)

Turnstile.displayName = 'Turnstile'

export default Turnstile
