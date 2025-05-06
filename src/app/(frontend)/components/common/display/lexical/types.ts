export interface LexicalNode {
  type?: string
  tag?: string
  format?: number | string
  text?: string
  url?: string
  target?: string
  language?: string
  checked?: boolean
  src?: string
  altText?: string
  children?: LexicalNode[]
  listType?: 'number' | 'bullet' | 'check'
  id?: string
  direction?: string
  fields?: {
    url?: string
    newTab?: boolean
    linkType?: string
    [key: string]: any
  }
  // For multi-line code blocks
  combinedCodeBlock?: boolean
  codeContent?: string
  [key: string]: any // Allow any additional properties
}

export interface LexicalRendererProps {
  content: any // The Lexical JSON content from the API
}
