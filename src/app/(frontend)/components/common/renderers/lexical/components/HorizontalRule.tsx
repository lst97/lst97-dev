import React from 'react'
import { LexicalHorizontalRuleNode } from '../types'

interface HorizontalRuleProps {
  node: LexicalHorizontalRuleNode
  index: number
}

export const HorizontalRule: React.FC<HorizontalRuleProps> = ({ node: _node, index }) => {
  return (
    <div
      key={`hr-${index}`}
      className="my-6 flex justify-center"
      role="separator"
      aria-orientation="horizontal"
    >
      <div
        className="w-full max-w-6xl h-1 bg-[var(--color-border)] dark:bg-[var(--color-border-dark)]"
        style={{
          imageRendering: 'pixelated',
          background: `repeating-linear-gradient(
            to right,
            var(--color-border) 0px,
            var(--color-border) 4px,
            transparent 4px,
            transparent 8px
          )`,
        }}
      />
    </div>
  )
}
