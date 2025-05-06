'use client'

import React from 'react'
import { LexicalNode } from '../../types'

interface ImageProps {
  node: LexicalNode
  index: number
}

export const Image: React.FC<ImageProps> = ({ node, index }) => {
  if (!node.src) return null

  return (
    <div key={`img-${index}`} className="mb-4">
      <div className="relative w-full h-auto max-h-[500px] flex justify-center p-2 bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border-2 border-[var(--color-border)] dark:border-[var(--color-border-dark)] before:content-[''] before:absolute before:w-1 before:h-1 before:-top-0.5 before:-left-0.5 before:bg-[var(--color-accent)] after:content-[''] after:absolute after:w-1 after:h-1 after:-bottom-0.5 after:-right-0.5 after:bg-[var(--color-accent)]">
        <img
          src={node.src}
          alt={node.altText || ''}
          className="object-contain max-h-[500px] [image-rendering:pixelated]"
        />
      </div>
      {node.altText && (
        <p className="text-center text-[var(--color-text)] dark:text-[var(--color-text-light)] opacity-70 text-sm mt-2">
          {node.altText}
        </p>
      )}
    </div>
  )
}
