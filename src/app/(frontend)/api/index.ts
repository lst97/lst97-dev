/**
 * API Utilities & Types
 *
 * This file provides common utilities, types, and constants for API endpoints.
 */

// Standard API response structure
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    // The type of `details` can be dynamic or unknown depending on the specific error,
    // so `any` is used for flexibility.
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    details?: any
  }
}

// HTTP status codes used across API endpoints
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

// Create standardized API responses
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  }
}

export function createErrorResponse(
  code: string,
  message: string,
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  details?: any,
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  }
}

// Helper for handling API errors
// the type of `error` can be dynamic or unknown depending on the specific error,
// so `any` is used for flexibility.
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export async function handleApiError(error: any): Promise<ApiResponse<never>> {
  if (error instanceof Response) {
    try {
      const errorData = await error.json()
      return createErrorResponse(
        String(error.status),
        errorData.message || 'Unknown error',
        errorData,
      )
    } catch {
      return createErrorResponse(
        String(error.status || 'UNKNOWN'),
        error.statusText || 'Unknown error',
      )
    }
  }

  return createErrorResponse('INTERNAL_ERROR', error.message || 'An unexpected error occurred')
}

// Cache control constants
export const CACHE_CONTROL = {
  NO_CACHE: 'no-cache, no-store, must-revalidate',
  SHORT: 'public, max-age=60, s-maxage=60', // 1 minute
  MEDIUM: 'public, max-age=300, s-maxage=300', // 5 minutes
  LONG: 'public, max-age=3600, s-maxage=3600', // 1 hour
  VERY_LONG: 'public, max-age=86400, s-maxage=86400', // 24 hours
}

// API endpoints mapping
export const API_ENDPOINTS = {
  GITHUB: '/api/github',
  WAKATIME: {
    ROOT: '/api/wakatime',
    CODE_ACTIVITY: '/api/wakatime/code-activity',
    EDITORS: '/api/wakatime/editors',
    LANGUAGES: '/api/wakatime/languages',
    OPERATING_SYSTEMS: '/api/wakatime/operating-systems',
  },
  WEATHER: '/api/weather',
  CONTACT: '/api/contact',
  AI_CHAT: '/api/ai-chat',
}
