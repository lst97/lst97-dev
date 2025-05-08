// Types for the main posts endpoint

export interface PostResponse {
  data: PostListItem[]
}

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

export interface PostListItem {
  id: string | number
  documentId: string | number
  title: string
  slug: string | null | undefined
  description: string
  publishedDate: string
  lastUpdatedDate: string | null | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any[] // List view does not include content
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
