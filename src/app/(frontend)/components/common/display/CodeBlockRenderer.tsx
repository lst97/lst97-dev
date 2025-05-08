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
import { type ReactNode, useState } from 'react'
import 'highlight.js/styles/base16/solarized-light.css'

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
  'python',
  'typescript',
  'css',
  'sql',
  'java',
  'csharp',
  'c',
  'markdown',
  'plaintext',
  'json',
  'xml',
  'cpp',
] as const

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

interface CodeBlockRendererProps {
  readonly children?: ReactNode
  readonly language?: SupportedLanguage
}

export const CodeBlockRenderer = ({ children, language }: CodeBlockRendererProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((error) => {
        console.error('Failed to copy text:', error)
      })
  }

  if (!language) return null
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return (
      <span className="text-red-500">
        Syntax Highlighting Error: UNSUPPORTED LANGUAGE &quot;{language}&quot;
      </span>
    )
  }

  if (Array.isArray(children)) {
    return children.map((child, index) => {
      if (typeof child.props.text !== 'string') return null
      try {
        const highlighted = language
          ? hljs.highlight(child.props.text, { language }).value
          : hljs.highlightAuto(child).value

        return (
          <div className="relative" key={index}>
            <pre className="p-1 border-4 border-[#2c2c2c] shadow-[inset_-4px_-4px_0_0_#a8a8a8] relative">
              <div className="absolute top-0 right-0 z-10 shadow-[0px_4px_0_0_#a8a8a8]">
                <div className="bg-amber-100 px-2 border-b-4 border-l-4 border-[#2c2c2c]">
                  <span className="text-sm font-mono">{`{${language.toUpperCase()}}`}</span>
                </div>
              </div>
              <div
                className="absolute bottom-4 right-4 z-10 shadow-[4px_4px_0_0_#a8a8a8]"
                onClick={() => handleCopy(child.props.text)}
              >
                <div className="text-center bg-amber-100 w-16 px-2 border-4 border-l-4 border-[#2c2c2c] hover:bg-amber-200 cursor-pointer">
                  <span className="text-sm font-mono">{copied ? '✓' : 'Copy'}</span>
                </div>
              </div>
              <code
                dangerouslySetInnerHTML={{ __html: highlighted }}
                className={`hljs language-${language || 'plaintext'} block whitespace-pre`}
              />
            </pre>
          </div>
        )
      } catch (error) {
        console.error('Error highlighting code:', error)
        return null
      }
    })
  }
  return null
}
