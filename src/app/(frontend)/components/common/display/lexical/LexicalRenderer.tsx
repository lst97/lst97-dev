'use client'

import { useMemo } from 'react'
import { LexicalRendererProps, LexicalNode, LexicalContent, LexicalCodeNode } from './types'
import { Paragraph, Heading, List, Link, Quote, Code, Image, TextFormat } from './components'

/**
 * Renders Lexical JSON content into a React component tree.
 *
 * This component takes Lexical editor state content (either as a JSON string or object)
 * and recursively renders the nodes into corresponding React elements.
 *
 * It employs a two-pass algorithm for rendering:
 * 1.  **First Pass:** Scans the nodes to identify multi-line code blocks, which are
 *     defined by ` ``` ` markers spanning multiple paragraph nodes. It collects the
 *     language and content for these blocks. This pass optimizes the handling of
 *     multi-line code blocks by pre-processing their content.
 * 2.  **Second Pass:** Iterates through the nodes again. If a node is the start of
 *     a multi-line code block identified in the first pass, it renders a single
 *     `Code` component with the pre-collected content and skips the subsequent nodes
 *     that belong to that block. Otherwise, it renders the node based on its type
 *     (paragraph, heading, list, image, single-node code block, etc.) using
 *     appropriate helper components.
 *
 * Error handling is included for invalid JSON content or parsing errors.
 *
 * @param {LexicalRendererProps} props - The component props.
 * @param {string | object | null | undefined} props.content - The Lexical editor state content, either as a JSON string or a parsed object.
 * @returns {React.ReactNode} The rendered React component tree or an error message.
 */
export const LexicalRenderer = ({ content }: LexicalRendererProps) => {
  const processedContent = useMemo(() => {
    if (!content) return null

    try {
      // Parse the Lexical JSON content
      const parsedContent =
        typeof content === 'string' ? (JSON.parse(content) as LexicalContent) : content

      if (!parsedContent.root || !parsedContent.root.children) {
        return (
          <div className="text-[var(--color-text)] dark:text-[var(--color-text-light)] font-['Press_Start_2P']">
            Invalid content format
          </div>
        )
      }

      // Process and render the Lexical nodes using the two-pass algorithm
      return renderLexicalNodes(parsedContent.root.children)
    } catch (error) {
      console.error('Error rendering Lexical content:', error)
      return (
        <div className="text-[var(--color-error)] font-['Press_Start_2P']">
          Error rendering content
        </div>
      )
    }
  }, [content])

  return (
    <div className="lexical-content font-['Press_Start_2P'] text-[var(--color-text)] dark:text-[var(--color-text-light)]">
      {processedContent}
    </div>
  )
}

// Function to safely get text content from node children
const getNodeText = (node: LexicalNode | undefined): string => {
  if (!node || !node.children || node.children.length === 0) return ''

  return node.children.map((child) => child.text || '').join('')
}

// Helper function to determine if a node is a single-node code block
const isSingleNodeCodeBlock = (node: LexicalNode): boolean => {
  if (!node) return false

  // Check for direct code node types first (cheaper checks)
  if (node.type === 'code' || node.type === 'codeBlock' || node.tag === 'code') return true

  // Check for code field
  if ('code' in node && typeof node.code === 'string') return true

  // Check for codeHighlight property
  if ('codeHighlight' in node) return true

  // Check if node has code format (more expensive, requires checking children)
  const hasCodeFormat =
    node.format === 16 ||
    ('textFormat' in node && node.textFormat === 16) ||
    (node.children && node.children.some((child) => child.format === 16))

  if (hasCodeFormat) return true

  // Most expensive check: markdown-style code block in a single node
  if (
    node.type === 'paragraph' &&
    node.children &&
    node.children.length === 1 &&
    node.children[0].text &&
    typeof node.children[0].text === 'string'
  ) {
    const match = node.children[0].text.match(/^```(\w*)\n([\s\S]*?)```$/m)
    if (match) return true
  }

  return false
}

// Component for rendering list items to improve readability
const ListItemRenderer = ({ node, index }: { node: LexicalNode; index: number }) => {
  if (node.checked !== undefined) {
    return (
      <li key={`li-${index}`} className="mb-2 flex items-start gap-2">
        <div
          className={`w-5 h-5 mt-1 flex-shrink-0 border-2 border-[var(--color-border)] dark:border-[var(--color-border-dark)] ${
            node.checked ? 'bg-[var(--color-accent)]' : 'bg-transparent'
          } relative`}
          style={{
            imageRendering: 'pixelated',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          }}
        >
          {node.checked && (
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold leading-none">
              ✓
            </span>
          )}
        </div>
        <div>
          <TextFormat node={node} index={index} />
        </div>
      </li>
    )
  }

  return (
    <li key={`li-${index}`} className="mb-2">
      <TextFormat node={node} index={index} />
    </li>
  )
}

// Function to process and render Lexical nodes
const renderLexicalNodes = (nodes: LexicalNode[]): React.ReactNode => {
  if (!nodes || !Array.isArray(nodes)) return null

  // First pass:
  // Scan for multi-line code blocks and build ranges with pre-collected content
  // This optimizes by collecting code block content during the first pass
  // -------------------------------------------------------------------
  const codeBlockRanges: { start: number; end: number; language: string; content: string }[] = []
  let inCodeBlock = false
  let currentCodeBlockStart = -1
  let currentCodeBlockLanguage = ''
  let currentCodeLines: string[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (!node) continue

    // Calculate node text only once per node
    const nodeText = node.type === 'paragraph' ? getNodeText(node) : ''

    // Check if this is start of a code block
    const codeBlockMatch = nodeText.match(/^```(\w*)$/)
    if (!inCodeBlock && codeBlockMatch && codeBlockMatch[1]) {
      inCodeBlock = true
      currentCodeBlockStart = i
      currentCodeBlockLanguage = codeBlockMatch[1]
      currentCodeLines = []
      continue
    }

    // Check if this is the end of a code block
    if (inCodeBlock && nodeText.trim() === '```') {
      codeBlockRanges.push({
        start: currentCodeBlockStart,
        end: i,
        language: currentCodeBlockLanguage,
        content: currentCodeLines.join('\n'),
      })
      inCodeBlock = false
      currentCodeBlockStart = -1
      currentCodeBlockLanguage = ''
      currentCodeLines = []
      continue
    }

    // Collect line content while in code block
    if (inCodeBlock && currentCodeBlockStart !== i) {
      currentCodeLines.push(getNodeText(node))
    }
  }

  // If we end without closing the code block, don't treat it as a code block
  inCodeBlock = false
  currentCodeBlockStart = -1
  currentCodeBlockLanguage = ''
  currentCodeLines = []

  // Second pass:
  // Render nodes, using the pre-collected code blocks from first pass
  // -------------------------------------------------------------------
  const result: React.ReactNode[] = []
  let skipUntil = -1

  for (let i = 0; i < nodes.length; i++) {
    // Skip nodes that are part of a multi-line code block
    if (i <= skipUntil) continue

    const node = nodes[i]
    if (!node) continue

    // Check if this node is the start of a multi-line code block
    const codeBlockRange = codeBlockRanges.find((range) => range.start === i)

    if (codeBlockRange) {
      // Create a combined code block node using pre-collected content
      const combinedCodeNode: LexicalCodeNode = {
        type: 'code',
        combinedCodeBlock: true,
        language: codeBlockRange.language,
        codeContent: codeBlockRange.content,
      }

      // Render the combined code block
      result.push(<Code key={`code-${i}`} node={combinedCodeNode} index={i} />)

      // Skip all nodes that are part of this code block
      skipUntil = codeBlockRange.end
    }
    // Check for single-node code blocks
    else if (isSingleNodeCodeBlock(node)) {
      // Create a proper code node with the correct type
      const codeNode: LexicalCodeNode = {
        ...node,
        type: 'code',
        // Ensure codeHighlight is a string if it exists
        codeHighlight: typeof node.codeHighlight === 'boolean' ? undefined : node.codeHighlight,
      }
      result.push(<Code key={`code-${i}`} node={codeNode} index={i} />)
    }
    // Links - check for both direct link type and link fields
    else if (node.type === 'link' || ('fields' in node && node.fields?.url) || 'url' in node) {
      result.push(<Link key={`link-${i}`} node={{ ...node, type: 'link' }} index={i} />)
    }
    // Process regular node types
    else {
      switch (node.type) {
        case 'paragraph':
          result.push(<Paragraph key={`p-${i}`} node={node} index={i} />)
          break
        case 'heading':
          result.push(<Heading key={`h-${i}`} node={node} index={i} />)
          break
        case 'list':
          result.push(<List key={`list-${i}`} node={node} index={i} />)
          break
        case 'listitem':
          result.push(<ListItemRenderer node={node} index={i} />)
          break
        case 'quote':
          result.push(<Quote key={`quote-${i}`} node={node} index={i} />)
          break
        case 'image':
          result.push(<Image key={`img-${i}`} node={node} index={i} alt={node.altText ?? ''} />)
          break
        default:
          // If it has text or children nodes, use TextFormat
          result.push(<TextFormat key={`text-${i}`} node={node} index={i} />)
      }
    }
  }

  return result
}
