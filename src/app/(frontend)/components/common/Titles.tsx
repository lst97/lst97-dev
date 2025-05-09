import React from 'react'

interface PkmTitleProps {
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary'
}

const variantMap = {
  primary: 'text-[#2c2c2c] [text-shadow:2px_2px_#a8a8a8] text-2xl font-bold',
  secondary: 'text-[#2c2c2c] [text-shadow:1px_1px_#a8a8a8] text-xl font-bold py-2 px-4',
}

export function PkmTitle({ children, className, variant = 'primary' }: PkmTitleProps) {
  return (
    <div
      className={`mx-4 md:mx-16 max-w-xl w-full relative press-start-2p-regular uppercase tracking-wider py-3 px-6 text-center border-4 border-border bg-[#fffbeb] font-bold [box-shadow:inset_-4px_-4px_0_0_#a8a8a8] ${variantMap[variant]} ${className || ''}`}
    >
      {/* Pseudo-element border */}
      <div
        className="pointer-events-none absolute -top-1 -left-1 -right-1 -bottom-1 border-2 border-[#fffbeb] z-10"
        aria-hidden="true"
      />
      <span className="relative z-20">{children}</span>
    </div>
  )
}
