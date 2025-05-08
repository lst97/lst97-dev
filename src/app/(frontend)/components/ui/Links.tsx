'use client'

import '@/frontend/styles/blinking-triangle.css'

import { startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import Link from 'next/link'

export function PkmLink({
  children,
  href,
  className,
}: {
  children?: React.ReactNode
  href: string
  className?: string
}) {
  return (
    <NavigationLink
      href={href}
      className={`blinking-triangle ${className} font-bold text-primary `}
    >
      {children}
    </NavigationLink>
  )
}

interface NavigationLinkProps {
  href: string
  className?: string
  children: ReactNode
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  [key: string]: unknown
}

/**
 * A wrapper around `next/link` that uses `startTransition` for navigation.
 * This helps integrate with React's concurrent features and can be used
 * to signal pending state for UI elements like a progress bar.
 *
 * It prevents default navigation for standard clicks and uses `router.push`
 * within `startTransition`. Modified clicks (e.g., Cmd+Click, Shift+Click,
 * middle mouse button, or target="_blank") are handled by the browser's
 * default behavior.
 *
 * @param {NavigationLinkProps} props - The component props.
 * @param {string} props.href - The URL to navigate to.
 * @param {string} [props.className] - Optional CSS class name.
 * @param {ReactNode} props.children - The content of the link.
 * @param {(e: React.MouseEvent<HTMLAnchorElement>) => void} [props.onClick] - Optional click handler to be called after internal logic.
 * @param {any} [props...] - Any other standard anchor element props.
 */
export function NavigationLink({
  href,
  className,
  children,
  onClick,
  ...props
}: NavigationLinkProps) {
  const router = useRouter()

  // Handle click to use startTransition
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isModifiedEvent =
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      (e.button && e.button !== 0) ||
      props.target === '_blank'

    // If it's not a modified click (new tab, etc.), prevent default
    // and handle with our transition approach
    if (!isModifiedEvent) {
      e.preventDefault()

      // Use startTransition to trigger the isPending state in our progress bar
      startTransition(() => {
        router.push(href)
      })
    }

    // If there's a custom onClick handler, call it
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  )
}
