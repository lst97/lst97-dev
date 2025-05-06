'use client'

import {
  RichTextContent,
  HeadingContent,
  ParagraphContent,
  ListContent,
  CodeContent,
  ImageContent,
  ListItem,
} from '@/frontend/models/Post'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import { useEffect, useRef } from 'react'
import React from 'react'

// Extend the types to support the additional properties needed
interface ExtendedHeadingContent extends HeadingContent {
  align?: 'left' | 'center' | 'right' | 'justify'
}

interface ExtendedParagraphContent extends ParagraphContent {
  align?: 'left' | 'center' | 'right' | 'justify'
}

// Instead of extending ListContent, create a new interface
interface CheckListContent {
  type: 'list'
  style: 'ordered' | 'unordered' | 'check'
  items: ListItem[]
}

interface ExtendedListItem extends ListItem {
  checked?: boolean
}

interface PostContentRendererProps {
  content: RichTextContent[] | null | undefined
}

export const PostContentRenderer = ({ content }: PostContentRendererProps) => {
  const codeBlockRefs = useRef<Array<HTMLElement | null>>([])

  useEffect(() => {
    // Apply syntax highlighting to code blocks
    codeBlockRefs.current.forEach((block) => {
      if (block) {
        hljs.highlightElement(block)
      }
    })
  }, [content])

  // Early return if content is null or undefined
  if (!content || !Array.isArray(content) || content.length === 0) {
    return (
      <div className="font-['Press_Start_2P'] text-[var(--color-text)] dark:text-[var(--color-text-light)]">
        No content available
      </div>
    )
  }

  // Helper function to parse and render formatted text with HTML tags
  const renderFormattedText = (text: string) => {
    // Replace basic formatting tags
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/~~(.*?)~~/g, '<span class="pixel-strikethrough">$1</span>') // Strikethrough with pixel style
      .replace(/__(.*?)__/g, '<span class="pixel-underline">$1</span>') // Underline with pixel style
      .replace(/\^(.*?)\^/g, '<sup>$1</sup>') // Superscript
      .replace(/~(.*?)~/g, '<sub>$1</sub>') // Subscript
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" class="pixel-underline text-[var(--color-accent)] hover:opacity-80 transition-opacity">$1</a>',
      ) // Links
  }

  const renderContent = (content: RichTextContent, index: number) => {
    switch (content.type) {
      case 'heading':
        return renderHeading(content as ExtendedHeadingContent, index)
      case 'paragraph':
        return renderParagraph(content as ExtendedParagraphContent, index)
      case 'list':
        return renderList(content as CheckListContent, index)
      case 'code':
        return renderCode(content as CodeContent, index)
      case 'image':
        return renderImage(content as ImageContent, index)
      default:
        return null
    }
  }

  const renderHeading = (content: ExtendedHeadingContent, index: number) => {
    const { level, text, align } = content

    const headingStyles =
      {
        1: "font-['Press_Start_2P'] text-2xl font-bold mb-4 text-[var(--color-text)] dark:text-[var(--color-text-light)]",
        2: "font-['Press_Start_2P'] text-xl font-semibold mb-3 text-[var(--color-text)] dark:text-[var(--color-text-light)]",
        3: "font-['Press_Start_2P'] text-lg font-medium mb-2 text-[var(--color-text)] dark:text-[var(--color-text-light)]",
        4: 'font-['Press_Start_2P'] text-lg font-medium mb-2 text-[var(--color-text)] dark:text-[var(--color-text-light)]',
        5: 'font-['Press_Start_2P'] text-base font-medium mb-1 text-[var(--color-text)] dark:text-[var(--color-text-light)]',
        6: 'font-['Press_Start_2P'] text-sm font-medium mb-1 text-[var(--color-text)] dark:text-[var(--color-text-light)]',
      }[level] ||
      "font-['Press_Start_2P'] text-xl font-bold mb-2 text-[var(--color-text)] dark:text-[var(--color-text-light)]"

    const alignClass = align ? `text-${align}` : ''
    const formattedText = renderFormattedText(text)
    const headingId = text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    // Create inline style for alignment to ensure it works
    const style: React.CSSProperties = {}
    if (align) {
      style.textAlign = align
    }

    switch (level) {
      case 1:
        return (
          <h1
            key={`heading-${index}`}
            className={`${headingStyles} ${alignClass}`}
            id={headingId}
            style={style}
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        )
      case 2:
        return (
          <h2
            key={`heading-${index}`}
            className={`${headingStyles} ${alignClass}`}
            id={headingId}
            style={style}
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        )
      case 3:
        return (
          <h3
            key={`heading-${index}`}
            className={`${headingStyles} ${alignClass}`}
            id={headingId}
            style={style}
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        )
      case 4:
        return (
          <h4
            key={`heading-${index}`}
            className={`${headingStyles} ${alignClass}`}
            id={headingId}
            style={style}
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        )
      case 5:
        return (
          <h5
            key={`heading-${index}`}
            className={`${headingStyles} ${alignClass}`}
            id={headingId}
            style={style}
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        )
      case 6:
        return (
          <h6
            key={`heading-${index}`}
            className={`${headingStyles} ${alignClass}`}
            id={headingId}
            style={style}
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        )
      default:
        return (
          <h2
            key={`heading-${index}`}
            className={`${headingStyles} ${alignClass}`}
            id={headingId}
            style={style}
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        )
    }
  }

  const renderParagraph = (content: ExtendedParagraphContent, index: number) => {
    const { text, align } = content
    const formattedText = renderFormattedText(text)
    const alignClass = align ? `text-${align}` : ''

    // Create inline style for alignment to ensure it works
    const style: React.CSSProperties = {}
    if (align) {
      style.textAlign = align
    }

    return (
      <p
        key={`paragraph-${index}`}
        className={`mb-4 font-['Press_Start_2P'] text-[var(--color-text)] dark:text-[var(--color-text-light)] ${alignClass}`}
        style={style}
        dangerouslySetInnerHTML={{ __html: formattedText }}
      />
    )
  }

  const renderList = (content: CheckListContent, index: number) => {
    const { style, items } = content

    if (style === 'ordered') {
      return (
        <ol
          key={`list-${index}`}
          className="list-decimal pl-6 mb-4 relative text-[var(--color-text)] dark:text-[var(--color-text-light)]"
          style={{ counterReset: 'item' }}
        >
          {items.map((item, itemIndex) => (
            <li
              key={`list-item-${index}-${itemIndex}`}
              className="mb-2 pl-2"
              style={{ position: 'relative', counterIncrement: 'item' }}
              dangerouslySetInnerHTML={{ __html: renderFormattedText(item.text) }}
            />
          ))}
        </ol>
      )
    }

    if (style === 'check') {
      return (
        <ul
          key={`check-list-${index}`}
          className="pl-6 mb-4 list-none text-[var(--color-text)] dark:text-[var(--color-text-light)]"
        >
          {items.map((item, itemIndex) => {
            const extendedItem = item as ExtendedListItem
            return (
              <li key={`check-item-${index}-${itemIndex}`} className="mb-2 flex items-start gap-2">
                <div
                  className={`w-5 h-5 mt-1 flex-shrink-0 border-2 border-[var(--color-border)] dark:border-[var(--color-border-dark)] ${
                    extendedItem.checked ? 'bg-[var(--color-accent)]' : 'bg-transparent'
                  } relative`}
                  style={{
                    imageRendering: 'pixelated',
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                  }}
                >
                  {extendedItem.checked && (
                    <span className="absolute inset-0 flex items-center justify-center text-white font-bold leading-none">
                      ✓
                    </span>
                  )}
                </div>
                <div dangerouslySetInnerHTML={{ __html: renderFormattedText(item.text) }} />
              </li>
            )
          })}
        </ul>
      )
    }

    // Default to unordered list
    return (
      <ul
        key={`ul-${index}`}
        className="pl-6 mb-4 relative list-none text-[var(--color-text)] dark:text-[var(--color-text-light)]"
      >
        {items.map((item, itemIndex) => (
          <li
            key={`list-item-${index}-${itemIndex}`}
            className="mb-2 pl-2 relative before:absolute before:content-['•'] before:left-[-1rem] before:text-[var(--color-accent)] before:font-bold"
            dangerouslySetInnerHTML={{ __html: renderFormattedText(item.text) }}
          />
        ))}
      </ul>
    )
  }

  const renderCode = (content: CodeContent, index: number) => {
    const { language, code } = content
    return (
      <div key={`code-${index}`} className="mb-6">
        <div className="bg-[var(--color-border)] dark:bg-[var(--color-border-dark)] text-[var(--color-text-light)] px-2 py-1 rounded-t-md text-sm font-['Press_Start_2P']">
          {language || 'code'}
        </div>
        <pre className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] overflow-x-auto rounded-b-md p-4 border-2 border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-[4px_4px_0_var(--shadow)]">
          <code
            ref={(el) => {
              codeBlockRefs.current[index] = el
            }}
            className={language ? `language-${language}` : ''}
          >
            {code}
          </code>
        </pre>
      </div>
    )
  }

  const renderImage = (content: ImageContent, index: number) => {
    const { url, altText } = content
    return (
      <div key={`image-${index}`} className="mb-6">
        <div className="relative w-full h-auto max-h-[500px] flex justify-center pixel-borders p-2 bg-[var(--color-card)] dark:bg-[var(--color-card-dark)]">
          <img src={url} alt={altText} className="object-contain max-h-[500px] image-pixelated" />
        </div>
        {altText && (
          <p className="text-center text-[var(--color-text)] dark:text-[var(--color-text-light)] opacity-70 text-sm mt-2 font-['Press_Start_2P']">
            {altText}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="post-content my-8">
      {content.map((item, index) => renderContent(item, index))}
    </div>
  )
}
