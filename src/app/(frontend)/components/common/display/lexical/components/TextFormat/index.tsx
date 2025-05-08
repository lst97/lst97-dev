'use client'

import React from 'react'
import { LexicalNode } from '../../types'
import { NodeRenderer } from '../NodeRenderer'
import { getTextAlignClass, getTextAlignStyle } from '../../utils/formatHelpers'

interface TextFormatProps {
  node: LexicalNode
  index: number
}

export const TextFormat: React.FC<TextFormatProps> = ({ node, index }) => {
  if (!node.text) {
    // If no text but has children, render the children
    if (node.children && node.children.length > 0) {
      return <NodeRenderer node={node} />
    }
    return null
  }

  const content = node.text
  const classNames: string[] = ['font-["Press_Start_2P"]']

  // Apply text formatting based on Lexical format flags
  if (typeof node.format === 'number') {
    if (node.format & 1) classNames.push('font-bold text-xs') // Bold
    if (node.format & 2) classNames.push('italic text-xs') // Italic
    if (node.format & 4)
      classNames.push(
        'relative after:content-[""] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-[length:4px_2px] after:bg-[image:linear-gradient(to_right,var(--color-accent)_75%,transparent_25%)] after:bg-repeat-x',
      ) // Underline with pixel style
    if (node.format & 8)
      classNames.push(
        'relative after:content-[""] after:absolute after:top-1/2 after:left-0 after:w-full after:h-[2px] after:bg-[length:4px_2px] after:bg-[image:linear-gradient(to_right,var(--color-accent)_75%,transparent_25%)] after:bg-repeat-x',
      ) // Strikethrough with pixel style
    if (node.format & 16) classNames.push('align-top relative top-[-0.5em]') // Superscript
    if (node.format & 32) classNames.push('align-bottom relative top-[0.3em]') // Subscript
    if (node.format & 64) classNames.push('align-top relative top-[-0.5em]') // Superscript on top right
  } else if (typeof node.format === 'string') {
    // Handle string-based alignment
    const alignClass = getTextAlignClass(node.format)
    if (alignClass) classNames.push(alignClass)
  }

  // Also check for textFormat property
  if (node.textFormat && typeof node.textFormat === 'number') {
    if (node.textFormat & 1) classNames.push('font-bold text-xs') // Bold
    if (node.textFormat & 2) classNames.push('italic text-xs') // Italic
    if (node.textFormat & 4) classNames.push('underline') // Underline
    if (node.textFormat & 8) classNames.push('line-through') // Strikethrough
    if (node.textFormat & 16) classNames.push('align-top relative top-[-0.5em]') // Superscript
    if (node.textFormat & 32) classNames.push('align-bottom relative top-[0.3em]') // Subscript
  } else if (node.textFormat && typeof node.textFormat === 'string') {
    // Handle string-based alignment
    const alignClass = getTextAlignClass(node.textFormat)
    if (alignClass) classNames.push(alignClass)
  }

  const style =
    typeof node.format === 'string'
      ? getTextAlignStyle(node.format)
      : node.textFormat && typeof node.textFormat === 'string'
        ? getTextAlignStyle(node.textFormat)
        : undefined

  return classNames.length > 0 ? (
    <span key={`text-${index}`} className={classNames.join(' ')} style={style}>
      {content}
    </span>
  ) : (
    <>{content}</>
  )
}
