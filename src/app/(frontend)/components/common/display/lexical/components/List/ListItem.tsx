'use client'

import React from 'react'
import { LexicalNode } from '../../types'
import { NodeRenderer } from '../NodeRenderer'

interface ListItemProps {
  node: LexicalNode
  index: number
  isCheckList?: boolean
  listType?: 'bullet' | 'number'
}

export const ListItem: React.FC<ListItemProps> = ({
  node,
  index,
  isCheckList = false,
  listType,
}) => {
  if (isCheckList || node.checked !== undefined) {
    return (
      <li key={`li-${index}`} className="mb-2 flex items-center gap-2 text-xs">
        <div
          className={`w-4 h-4 flex-shrink-0 border-2 border-[var(--color-border)] dark:border-[var(--color-border-dark)] relative [image-rendering:pixelated] ${
            node.checked ? 'bg-[var(--color-accent)]' : 'bg-transparent'
          }`}
          aria-checked={node.checked}
          role="checkbox"
        >
          {node.checked && (
            <svg
              viewBox="0 0 16 16"
              className="absolute inset-0 w-full h-full p-[2px]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 8L6 11L13 4"
                stroke="var(--color-background)"
                strokeWidth="2"
                strokeLinecap="square"
                className="dark:stroke-[var(--color-background-dark)]"
              />
            </svg>
          )}
        </div>
        <div>
          <NodeRenderer node={node} />
        </div>
      </li>
    )
  }

  if (listType === 'number') {
    return (
      <li key={`li-${index}`} className="mb-3 relative pl-2 flex items-center text-xs">
        <div className="absolute left-[-1.5rem] w-7 h-7 flex items-center justify-center">
          <div className="w-5 h-5 relative border-2 border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-accent)] [image-rendering:pixelated] flex items-center justify-center">
            {/* Pixel corners */}
            <div className="absolute top-[-2px] left-[-2px] w-1 h-1 bg-[var(--color-border)] dark:bg-[var(--color-border-dark)]"></div>
            <div className="absolute top-[-2px] right-[-2px] w-1 h-1 bg-[var(--color-border)] dark:bg-[var(--color-border-dark)]"></div>
            <div className="absolute bottom-[-2px] left-[-2px] w-1 h-1 bg-[var(--color-border)] dark:bg-[var(--color-border-dark)]"></div>
            <div className="absolute bottom-[-2px] right-[-2px] w-1 h-1 bg-[var(--color-border)] dark:bg-[var(--color-border-dark)]"></div>

            <span className="font-['Press_Start_2P'] text-[10px] text-[var(--color-background)] dark:text-[var(--color-background-dark)] leading-none select-none">
              {index + 1}
            </span>
          </div>
        </div>
        <NodeRenderer node={node} />
      </li>
    )
  }

  return (
    <li key={`li-${index}`} className="mb-3 relative pl-2 flex items-center text-xs">
      <div className="absolute left-[-1.3rem] w-6 h-6 flex items-center justify-center">
        <div className="w-3 h-3 border-2 border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-accent)] relative [image-rendering:pixelated] rotate-45"></div>
      </div>
      <NodeRenderer node={node} />
    </li>
  )
}
