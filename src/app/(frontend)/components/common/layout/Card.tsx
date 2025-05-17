import React from 'react'

type CardProps = {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div
      className={`relative bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border-4 border-[var(--color-border)] dark:border-[var(--color-border-dark)] rounded-lg overflow-hidden transition-all duration-300 ${className || ''}`}
      style={{
        boxShadow: '8px 8px 0 var(--shadow)',
      }}
    >
      {children}
    </div>
  )
}

export default Card
