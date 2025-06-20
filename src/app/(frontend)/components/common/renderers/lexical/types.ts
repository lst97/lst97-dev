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
    [key: string]: unknown
  }
  // For multi-line code blocks
  combinedCodeBlock?: boolean
  codeContent?: string
  // Properties for code blocks
  code?: string
  codeHighlight?: string
  textFormat?: number | string
  // Properties for upload/media nodes
  relationTo?: string
  value?: {
    id: number
    alt?: string
    filename?: string
    url?: string
    width?: number
    height?: number
    mimeType?: string
    filesize?: number
    createdAt?: string
    updatedAt?: string
    thumbnailURL?: string | null
    focalX?: number
    focalY?: number
  }
  version?: number
  // Index signature for additional properties
  [key: string]: unknown
}

// Specific node type for code nodes
export interface LexicalCodeNode extends LexicalNode {
  type: 'code'
  language?: string
  codeContent?: string
  code?: string
  codeHighlight?: string
}

// Specific node type for horizontal rule
export interface LexicalHorizontalRuleNode extends LexicalNode {
  type: 'horizontalrule'
  version?: number
}

// Specific node type for media/upload nodes
export interface LexicalMediaNode extends LexicalNode {
  type: 'upload'
  id: string
  relationTo: string
  value: {
    id: number
    alt?: string
    filename?: string
    url?: string
    width?: number
    height?: number
    mimeType?: string
    filesize?: number
    createdAt?: string
    updatedAt?: string
    thumbnailURL?: string | null
    focalX?: number
    focalY?: number
  }
  version?: number
}

export interface LexicalContent {
  root: {
    children: LexicalNode[]
    direction?: string
    format?: string | number
    indent?: number
    type?: string
    version?: number
  }
}

export interface LexicalRendererProps {
  content: string | LexicalContent | null | undefined
}
