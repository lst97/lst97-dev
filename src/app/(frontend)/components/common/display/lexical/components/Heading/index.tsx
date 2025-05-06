'use client'

import React from 'react'
import { LexicalNode } from '../../types'
import {
  getTextAlignClass,
  getTextAlignStyle,
  extractTextFromNode,
} from '../../utils/formatHelpers'
import { NodeRenderer } from '../NodeRenderer'

interface HeadingProps {
  node: LexicalNode
  index: number
}

export const Heading: React.FC<HeadingProps> = ({ node, index }) => {
  const headingContent = <NodeRenderer node={node} />
  const headingText = extractTextFromNode(node) || `heading-${index}`
  const headingId = headingText
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  // Get text alignment class if format is present
  const alignClass = node.format ? getTextAlignClass(node.format) : ''
  const alignStyle = node.format ? getTextAlignStyle(node.format) : undefined

  switch (node.tag) {
    case 'h1':
      return (
        <h1
          key={`h1-${index}`}
          id={headingId}
          className={`text-2xl font-bold mb-4 text-[var(--color-text)] dark:text-[var(--color-text-light)] ${alignClass}`}
          style={alignStyle}
        >
          {headingContent}
        </h1>
      )
    case 'h2':
      return (
        <h2
          key={`h2-${index}`}
          id={headingId}
          className={`text-xl font-semibold mb-3 text-[var(--color-text)] dark:text-[var(--color-text-light)] ${alignClass}`}
          style={alignStyle}
        >
          {headingContent}
        </h2>
      )
    case 'h3':
      return (
        <h3
          key={`h3-${index}`}
          id={headingId}
          className={`text-lg font-medium mb-2 text-[var(--color-text)] dark:text-[var(--color-text-light)] ${alignClass}`}
          style={alignStyle}
        >
          {headingContent}
        </h3>
      )
    case 'h4':
      return (
        <h4
          key={`h4-${index}`}
          id={headingId}
          className={`font-['Press_Start_2P'] text-lg font-medium mb-2 text-[var(--color-text)] dark:text-[var(--color-text-light)] ${alignClass}`}
          style={alignStyle}
        >
          {headingContent}
        </h4>
      )
    case 'h5':
      return (
        <h5
          key={`h5-${index}`}
          id={headingId}
          className={`font-['Press_Start_2P'] text-base font-medium mb-1 text-[var(--color-text)] dark:text-[var(--color-text-light)] ${alignClass}`}
          style={alignStyle}
        >
          {headingContent}
        </h5>
      )
    default:
      return (
        <h6
          key={`h6-${index}`}
          id={headingId}
          className={`font-['Press_Start_2P'] text-sm font-medium mb-1 text-[var(--color-text)] dark:text-[var(--color-text-light)] ${alignClass}`}
          style={alignStyle}
        >
          {headingContent}
        </h6>
      )
  }
}
