'use client'

import React, { useState, useEffect } from 'react'
import { LexicalNode } from '@/frontend/components/common/display/lexical/types'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import typescript from 'highlight.js/lib/languages/typescript'
import css from 'highlight.js/lib/languages/css'
import sql from 'highlight.js/lib/languages/sql'
import java from 'highlight.js/lib/languages/java'
import csharp from 'highlight.js/lib/languages/csharp'
import c from 'highlight.js/lib/languages/c'
import markdown from 'highlight.js/lib/languages/markdown'
import plain from 'highlight.js/lib/languages/plaintext'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import cpp from 'highlight.js/lib/languages/cpp'
import 'highlight.js/styles/base16/solarized-light.css'

// Register languages
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('java', java)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('c', c)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('plaintext', plain)
hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('cpp', cpp)

const SUPPORTED_LANGUAGES = [
  'javascript',
  'js',
  'python',
  'py',
  'typescript',
  'ts',
  'css',
  'sql',
  'java',
  'csharp',
  'cs',
  'c',
  'markdown',
  'md',
  'plaintext',
  'txt',
  'json',
  'xml',
  'html',
  'cpp',
]

// Map short code to full language name
const LANGUAGE_MAP: Record<string, string> = {
  js: 'javascript',
  py: 'python',
  ts: 'typescript',
  cs: 'csharp',
  md: 'markdown',
  txt: 'plaintext',
  html: 'xml',
}

// Extended interface for better type safety
interface LexicalCodeNode extends LexicalNode {
  combinedCodeBlock?: boolean
  codeContent?: string
  code?: string
  codeHighlight?: string
  language?: string
  fields?: {
    language?: string
    [key: string]: any
  }
  text?: string
  format?: number | string
  textFormat?: number | string
  children?: LexicalCodeNode[]
}

interface CodeProps {
  node: LexicalCodeNode
  index: number
}

export const Code: React.FC<CodeProps> = ({ node, index }) => {
  const [copied, setCopied] = useState(false)
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null)

  // Extract code content from the node
  const codeContent = React.useMemo(() => {
    // First check for combined multi-node code blocks (created in LexicalRenderer)
    if (node.combinedCodeBlock && node.codeContent) {
      return node.codeContent
    }

    // Check all possible locations where code content might be stored
    if (node.code) {
      return node.code
    }

    if (node.codeHighlight) {
      return node.codeHighlight
    }

    // Handle markdown-style code blocks
    if (node.text) {
      const text = node.text
      // Check if this is a markdown style code block (```language...```)
      const codeBlockMatch = text.match(/^```(\w*)\n([\s\S]*?)```$/m)
      if (codeBlockMatch) {
        return codeBlockMatch[2] // Return the code inside the block
      }
    }

    // Special case for Lexical paragraphs with format 16 (code format)
    // or paragraphs with children that have format 16
    if (
      node.format === 16 ||
      node.textFormat === 16 ||
      (node.children && node.children.some((child) => child.format === 16))
    ) {
      if (node.children && node.children.length > 0) {
        return node.children
          .map((child) => {
            if (child.text) return child.text
            return ''
          })
          .join('')
      }
    }

    // Special case for Lexical format where content might be in a specific child node
    if (node.children && node.children.length > 0) {
      // First try to find a child with code content
      const codeChild = node.children.find((child) => child.code || child.codeHighlight)
      if (codeChild) {
        return codeChild.code || codeChild.codeHighlight || ''
      }

      // Otherwise extract text from all children
      return node.children
        .map((child) => {
          if (child.text) return child.text
          return ''
        })
        .join('\n')
    }

    return ''
  }, [node])

  // Get the language (check multiple possible properties)
  const language = React.useMemo(() => {
    // First check for combined multi-node code blocks (created in LexicalRenderer)
    if (node.combinedCodeBlock && node.language) {
      let lang = node.language

      // Normalize language name
      lang = lang.toLowerCase()
      if (LANGUAGE_MAP[lang]) {
        lang = LANGUAGE_MAP[lang]
      }

      // Fallback to plaintext if not supported
      if (!SUPPORTED_LANGUAGES.includes(lang)) {
        lang = 'plaintext'
      }

      return lang
    }

    // Check multiple sources for language info
    let lang = node.language || (node.fields && node.fields.language) || 'plaintext'

    // Check for markdown style language declaration
    if (node.text) {
      const text = node.text
      const codeBlockMatch = text.match(/^```(\w*)\n/m)
      if (codeBlockMatch && codeBlockMatch[1]) {
        lang = codeBlockMatch[1]
      }
    }

    // Normalize language name
    lang = lang.toLowerCase()
    if (LANGUAGE_MAP[lang]) {
      lang = LANGUAGE_MAP[lang]
    }

    // Fallback to plaintext if not supported
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      lang = 'plaintext'
    }

    return lang
  }, [node])

  // Highlight the code
  useEffect(() => {
    if (codeContent) {
      try {
        const highlighted = hljs.highlight(codeContent, { language }).value
        setHighlightedCode(highlighted)
      } catch (error) {
        console.error('Error highlighting code:', error)
        setHighlightedCode(codeContent)
      }
    }
  }, [codeContent, language])

  const handleCopy = () => {
    if (codeContent) {
      navigator.clipboard.writeText(codeContent).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  // If there's no code content, show a placeholder instead of NodeRenderer
  if (!codeContent.length) {
    return (
      <div className="mb-6 relative">
        <pre className="p-4 border-4 border-[#2c2c2c] shadow-[inset_-4px_-4px_0_0_#a8a8a8]">
          <code className="font-['Press_Start_2P'] text-gray-400">// Empty code block</code>
        </pre>
      </div>
    )
  }

  return (
    <div key={`code-${index}`} className="mb-6 relative">
      <pre className="p-1 border-4 border-[#2c2c2c] shadow-[inset_-4px_-4px_0_0_#a8a8a8] relative">
        <div className="absolute top-0 right-0 z-10 shadow-[0px_4px_0_0_#a8a8a8]">
          <div className="bg-amber-100 px-2 border-b-4 border-l-4 border-[#2c2c2c]">
            <span className="text-sm font-['Press_Start_2P']">{`{${language.toUpperCase()}}`}</span>
          </div>
        </div>
        <button
          className="absolute bottom-4 right-4 z-10 shadow-[4px_4px_0_0_#a8a8a8] focus:outline-none focus:ring-2 focus:ring-amber-400"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
        >
          <div className="text-center bg-amber-100 w-16 px-2 border-4 border-l-4 border-[#2c2c2c] hover:bg-amber-200 cursor-pointer">
            <span className="text-sm font-['Press_Start_2P']">{copied ? '✓ Copied' : 'Copy'}</span>
          </div>
        </button>
        {highlightedCode ? (
          <code
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
            className={`hljs language-${language} block whitespace-pre font-['Press_Start_2P'] text-[var(--color-text)] dark:text-[var(--color-text-light)] text-xs leading-6`}
          />
        ) : (
          <code className="font-['Press_Start_2P'] text-[var(--color-text)] dark:text-[var(--color-text-light)] whitespace-pre-wrap break-words block w-full">
            {codeContent}
          </code>
        )}
      </pre>
    </div>
  )
}
