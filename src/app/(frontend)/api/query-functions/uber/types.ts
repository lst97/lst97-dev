import { UberComment } from '@/payload-types'

export interface CreateUberCommentResponse {
  message: string
  doc: UberComment
}

export interface UberCommentFormData {
  name: string
  type: string
  comment: string
  rating: number
  turnstileToken?: string
}

export interface UberCommentsResponse {
  docs: UberComment[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}
