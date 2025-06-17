import { UberCommentsResponse, UberCommentFormData, CreateUberCommentResponse } from './types'

/**
 * Fetch approved Uber comments from PayloadCMS
 */
export const fetchUberComments = async (
  page: number = 1,
  limit: number = 20,
): Promise<UberCommentsResponse> => {
  try {
    const response = await fetch(
      `/api/uber-comments?where[status][equals]=approved&sort=-createdAt&page=${page}&limit=${limit}`,
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

    return result
  } catch (error) {
    console.error('Error fetching uber comments:', error)
    throw error
  }
}

/**
 * Create a new Uber comment via PayloadCMS REST API
 */
export const createUberComment = async (
  data: UberCommentFormData,
): Promise<CreateUberCommentResponse> => {
  const response = await fetch('/api/uber-comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerName: data.name.trim(),
      orderType: data.type,
      comment: data.comment.trim(),
      rating: Number(data.rating),
      status: 'pending', // All new comments start as pending
      turnstileToken: data.turnstileToken,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to create comment: ${response.statusText}`)
  }

  return response.json()
}
