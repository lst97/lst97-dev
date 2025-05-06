// Post interface for frontend use

export interface Post {
  documentId: string
  title: string
  description: string
  slug: string
  publishedDate: string
  lastUpdatedDate?: string
  featuredImage?: string
  content: any
  categories: string[]
  tags?: string[]
  postStatus: 'draft' | 'published' | 'archived'
  author: {
    id: string
    name: string
    bio?: string
    profilePictureUrl?: string
  }
  featuredPost: boolean
  commentsEnabled: boolean
  views: number
  likes: number
  readtime: number
  tableOfContents?: TableOfContentItem[]
}

export type PostSortField = 'publishedDate' | 'views' | 'likes' | 'title' | 'readtime'

export interface TableOfContentItem {
  id: string
  text: string
  level: number
  items?: TableOfContentItem[]
}

// Lexical content format
export interface LexicalContent {
  root: {
    type: string
    format?: string
    indent?: number
    version?: number
    children: LexicalNode[]
    direction?: string
  }
}

export interface LexicalNode {
  type: string
  format?: string
  indent?: number
  version?: number
  children?: LexicalNode[]
  tag?: string
  text?: string
  mode?: string
  style?: string
  detail?: number
  direction?: string
  fields?: {
    url?: string
    newTab?: boolean
    linkType?: string
  }
  listType?: 'number' | 'bullet' | 'check'
  checked?: boolean
  language?: string
  code?: string
  [key: string]: any
}

// Rich Text Content definitions
export interface RichTextContent {
  type: string
  children?: RichTextContent[]
  [key: string]: any
}

// Legacy content types (for backward compatibility or reference)
export type LegacyPostContent =
  | HeadingContent
  | ParagraphContent
  | ListContent
  | CodeContent
  | ImageContent

export interface HeadingContent {
  type: 'heading'
  level: number
  text: string
}

export interface ParagraphContent {
  type: 'paragraph'
  text: string
}

export interface ListContent {
  type: 'list'
  style: 'ordered' | 'unordered'
  items: ListItem[]
}

export interface ListItem {
  type: 'listItem'
  text: string
}

export interface CodeContent {
  type: 'code'
  language: string
  code: string
}

export interface ImageContent {
  type: 'image'
  url: string
  altText: string
}
