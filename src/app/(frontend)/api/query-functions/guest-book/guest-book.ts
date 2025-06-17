import {
  GuestBookCommentFormData,
  CreateGuestBookCommentResponse,
  GetGuestBookCommentsResponse,
} from './types'

const API_BASE_URL = '/api'

/**
 * Fetch approved guest book comments from PayloadCMS
 */
export const fetchGuestBookComments = async (
  page: number = 1,
  limit: number = 20,
): Promise<GetGuestBookCommentsResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/guest-book-comments?where[approved][equals]=true&sort=-createdAt&page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    return {
      success: true,
      data: result.docs || [],
      totalDocs: result.totalDocs,
      limit: result.limit,
      page: result.page,
      totalPages: result.totalPages,
    }
  } catch (error) {
    console.error('Error fetching guest book comments:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch comments',
      data: [],
    }
  }
}

/**
 * Create a new guest book comment via PayloadCMS REST API
 */
export const createGuestBookComment = async (
  commentData: GuestBookCommentFormData,
): Promise<CreateGuestBookCommentResponse> => {
  try {
    // Get client IP and user agent for moderation
    const ipResponse = await fetch('/api/client-info')
    const clientInfo = await ipResponse.json()

    const response = await fetch(`${API_BASE_URL}/guest-book-comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...commentData,
        ipAddress: clientInfo.ip,
        userAgent: clientInfo.userAgent,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    return {
      success: true,
      data: result.doc,
    }
  } catch (error) {
    console.error('Error creating guest book comment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create comment',
    }
  }
}
