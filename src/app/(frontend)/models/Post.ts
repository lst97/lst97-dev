// Post interface for frontend usage
export interface Post {
  id: string | number
  documentId: string | number
  title: string
  slug: string | null | undefined
  description: string
  publishedDate: string
  lastUpdatedDate?: string | null
  content: LexicalContent
  featuredImage: string | null | undefined
  categories: (string | null | undefined)[]
  tags: (string | null | undefined)[]
  views: number
  likes: number
  readtime: number
  featuredPost: boolean
  postStatus: string
  commentsEnabled: boolean
  author: {
    id: string | number
    name: string
  }
}

// Response types for different API endpoints
export interface PostListResponse {
  data: Post[]
}

export interface PostDetailResponse {
  data: Post
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
    direction?: string | null
  }
}

export interface LexicalNode {
  type: string
  format?: number | string
  indent?: number
  version?: number
  children?: LexicalNode[]
  tag?: string
  text?: string
  mode?: string
  style?: string
  detail?: number
  direction?: string | null
  fields?: {
    url?: string
    newTab?: boolean
    linkType?: string
  }
  listType?: 'number' | 'bullet' | 'check'
  checked?: boolean
  language?: string
  code?: string
  [key: string]: unknown
}

// Rich Text Content definitions (legacy format)
export interface RichTextContent {
  type: string
  children?: RichTextContent[]
  [key: string]: unknown
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
