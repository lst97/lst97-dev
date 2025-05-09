'use client'

import React from 'react'
import { LexicalNode } from '../../types'
import { NodeRenderer } from '../NodeRenderer'

interface LinkProps {
  node: LexicalNode
  index: number
}

export const Link: React.FC<LinkProps> = ({ node, index }) => {
  // Extract the URL from either direct property or fields object
  const url = node.url || (node.fields && node.fields.url)

  if (!url) return <NodeRenderer node={node} />

  // Extract target and rel props
  // New tab can be from target property or fields.newTab
  const openNewTab = node.target === '_blank' || (node.fields && node.fields.newTab)

  return (
    <a
      key={`link-${index}`}
      href={url}
      target={openNewTab ? '_blank' : '_self'}
      rel={openNewTab ? 'noopener noreferrer' : undefined}
      className="text-[var(--color-accent)] relative transition-opacity hover:opacity-80 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-[length:4px_2px] after:bg-[image:linear-gradient(to_right,var(--color-accent)_75%,transparent_25%)] after:bg-repeat-x"
    >
      <NodeRenderer node={node} />
    </a>
  )
}
