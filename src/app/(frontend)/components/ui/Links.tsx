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
  [key: string]: any // For any other props
}

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
