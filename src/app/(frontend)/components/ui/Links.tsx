import Link from 'next/link'
import '@/frontend/styles/blinking-triangle.css'

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
    <Link href={href} className={`blinking-triangle ${className} font-bold text-primary `}>
      {children}
    </Link>
  )
}
