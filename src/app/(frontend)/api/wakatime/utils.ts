import { NextResponse } from 'next/server'
import { createSuccessResponse, createErrorResponse, HttpStatus, CACHE_CONTROL } from '../index'

/**
 * Fetches data from WakaTime API endpoints and returns standardized responses
 */
export async function fetchWakaTimeData(url: string) {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch WakaTime data: ${response.statusText}`)
    }

    // WakaTime API returns data in format: { data: [...] }
    // We'll keep this structure intact when returning it
    const rawData = await response.json()

    return NextResponse.json(createSuccessResponse(rawData), {
      status: HttpStatus.OK,
      headers: {
        'Cache-Control': CACHE_CONTROL.MEDIUM, // Cache for 5 minutes
      },
    })
  } catch (error) {
    console.error('Error fetching WakaTime data:', error)

    return NextResponse.json(
      createErrorResponse('WAKATIME_API_ERROR', 'Failed to fetch WakaTime data'),
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    )
  }
}
