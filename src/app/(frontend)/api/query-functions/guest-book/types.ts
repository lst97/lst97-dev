export interface GuestBookComment {
  id: number
  name: string
  comment: string
  approved: boolean
  turnstileVerified: boolean
  ipAddress?: string
  userAgent?: string
  createdAt: string
  updatedAt: string
}

export interface GuestBookCommentFormData {
  name: string
  comment: string
  turnstileToken?: string
}

export interface CreateGuestBookCommentResponse {
  success: boolean
  data?: GuestBookComment
  error?: string
}

export interface GetGuestBookCommentsResponse {
  success: boolean
  data?: GuestBookComment[]
  error?: string
  totalDocs?: number
  limit?: number
  page?: number
  totalPages?: number
}
