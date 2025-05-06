import React from 'react'
import { LexicalNode } from '../types'

// Helper function to determine text alignment class based on format
export function getTextAlignClass(format: number | string): string {
  if (typeof format === 'string') {
    switch (format.toLowerCase()) {
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      case 'justify':
        return 'text-justify'
      default:
        return '' // Default to left alignment
    }
  }

  // Handle numeric format (legacy)
  switch (format) {
    case 1:
      return 'text-center'
    case 2:
      return 'text-right'
    case 3:
      return 'text-justify'
    default:
      return '' // Default to left alignment
  }
}

// Helper function to ensure text alignment works properly with !important
export function getTextAlignStyle(format: number | string): React.CSSProperties | undefined {
  if (typeof format === 'string') {
    switch (format.toLowerCase()) {
      case 'center':
        return { textAlign: 'center' as const }
      case 'right':
        return { textAlign: 'right' as const }
      case 'justify':
        return { textAlign: 'justify' as const }
      default:
        return undefined
    }
  }

  // Handle numeric format (legacy)
  switch (format) {
    case 1:
      return { textAlign: 'center' as const }
    case 2:
      return { textAlign: 'right' as const }
    case 3:
      return { textAlign: 'justify' as const }
    default:
      return undefined
  }
}

// Helper function to extract text from a Lexical node
export function extractTextFromNode(node: LexicalNode): string {
  if (!node) return ''

  if (node.text) {
    return node.text
  }

  if (node.children && node.children.length > 0) {
    return node.children.map((child) => extractTextFromNode(child)).join('')
  }

  return ''
}

// Helper function to extract all text from Lexical content
export function extractTextFromLexical(content: any): string {
  if (!content) return ''

  try {
    const parsedContent = typeof content === 'string' ? JSON.parse(content) : content
    if (!parsedContent.root || !parsedContent.root.children) return ''

    return parsedContent.root.children
      .map((node: LexicalNode) => extractTextFromNode(node))
      .join(' ')
      .trim()
      .substring(0, 200)
  } catch (error) {
    console.error('Error extracting text from Lexical content:', error)
    return ''
  }
}
