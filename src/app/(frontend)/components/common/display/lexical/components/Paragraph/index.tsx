'use client'

import React from 'react'
import { LexicalNode, LexicalCodeNode } from '@/frontend/components/common/display/lexical/types'
import {
  getTextAlignClass,
  getTextAlignStyle,
} from '@/frontend/components/common/display/lexical/utils/formatHelpers'
import { NodeRenderer } from '@/frontend/components/common/display/lexical/components/NodeRenderer'
import { Code } from '@/frontend/components/common/display/lexical/components/Code'

interface ParagraphProps {
  node: LexicalNode
  index: number
}

export const Paragraph: React.FC<ParagraphProps> = ({ node, index }) => {
  // Check for markdown-style code blocks
  const isMarkdownCodeBlock =
    node.children &&
    node.children.length === 1 &&
    node.children[0].text &&
    typeof node.children[0].text === 'string' &&
    node.children[0].text.match(/^```(\w*)\n([\s\S]*?)```$/m)

  // In Lexical format 16 indicates code formatting
  // Check for various ways code blocks might be identified
  const isCodeBlock =
    node.codeHighlight !== undefined ||
    node.code !== undefined ||
    node.tag === 'code' ||
    node.format === 16 ||
    node.textFormat === 16 ||
    isMarkdownCodeBlock ||
    (node.children && node.children.some((child) => child.format === 16))

  if (isCodeBlock) {
    // Cast to LexicalCodeNode with proper typing
    const codeNode: LexicalCodeNode = {
      ...node,
      type: 'code',
    }
    return <Code node={codeNode} index={index} />
  }

  // Handle text alignment
  // format can be a number, string, or undefined
  const format =
    node.format !== undefined ? node.format : node.textFormat !== undefined ? node.textFormat : null

  // Get alignment class and style (if any)
  const alignClass = format !== null ? getTextAlignClass(format) : ''
  const alignStyle = format !== null ? getTextAlignStyle(format) : undefined

  return (
    <p
      key={`p-${index}`}
      className={`text-xs leading-relaxed mb-4 ${alignClass}`}
      style={alignStyle}
    >
      <NodeRenderer node={node} />
    </p>
  )
}
