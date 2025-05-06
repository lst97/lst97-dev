'use client'

import { LexicalRenderer } from '@/frontend/components/common/display/lexical'

interface BlockRendererClientProps {
  readonly content: any
}

export const BlockRendererClient = ({ content }: BlockRendererClientProps) => {
  if (!content) return null

  return <LexicalRenderer content={content} />
}
