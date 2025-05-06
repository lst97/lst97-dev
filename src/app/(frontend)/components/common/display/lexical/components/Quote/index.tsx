'use client'

import React from 'react'
import { LexicalNode } from '../../types'
import { NodeRenderer } from '../NodeRenderer'

interface QuoteProps {
  node: LexicalNode
  index: number
}

export const Quote: React.FC<QuoteProps> = ({ node, index }) => {
  return (
    <div className="my-8 relative">
      {/* Pixelated drop shadow effect */}
      <div
        className="absolute inset-0 translate-x-[4px] translate-y-[4px] bg-[var(--color-border)] dark:bg-[var(--color-border-dark)] opacity-20"
        style={{
          clipPath:
            'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
        }}
      ></div>

      <blockquote
        key={`quote-${index}`}
        className="relative p-4 font-['VT323'] image-pixelated transition-transform hover:scale-[1.01] bg-amber-100"
        style={{
          border: '4px solid',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Pixelated quote marks */}
        <div className="absolute -left-2 -top-2 text-[var(--color-accent)] text-3xl font-['Press_Start_2P'] animate-bounce z-10">
          "
        </div>
        <div
          className="absolute -right-2 -bottom-2 text-[var(--color-accent)] text-3xl font-['Press_Start_2P'] animate-bounce z-10"
          style={{ animationDelay: '0.4s' }}
        >
          "
        </div>

        {/* Quote content with pixelated font */}
        <div className="relative z-10 pl-4 italic text-sm">
          <NodeRenderer node={node} />
        </div>
      </blockquote>
    </div>
  )
}
