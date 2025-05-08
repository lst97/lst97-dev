'use client'

import { LexicalRenderer } from '@/frontend/components/common/display/lexical'

interface BlockRendererClientProps {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  readonly content: any
}

export const BlockRendererClient = ({ content }: BlockRendererClientProps) => {
  if (!content) return null

  return <LexicalRenderer content={content} />
}
