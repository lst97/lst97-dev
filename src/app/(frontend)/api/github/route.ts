import { NextRequest, NextResponse } from 'next/server'
import { createSuccessResponse, createErrorResponse, HttpStatus, CACHE_CONTROL } from '../index'

/**
 * API route that proxies requests to the GitHub README Stats service
 * This helps avoid CORS issues when loading the stats from the client side
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get('username') || 'lst97'
    const theme = searchParams.get('theme') || 'dark'
    const hide = searchParams.get('hide') || ''
    const show_icons = searchParams.has('show_icons') ? searchParams.get('show_icons') : 'true'
    const include_all_commits = searchParams.has('include_all_commits')
      ? searchParams.get('include_all_commits')
      : 'true'
    const count_private = searchParams.has('count_private')
      ? searchParams.get('count_private')
      : 'true'

    // Construct the URL for the GitHub README Stats service
    const url = new URL('https://github-stats.lst97.dev/api')
    url.searchParams.append('username', username)
    url.searchParams.append('theme', theme)

    if (hide) {
      url.searchParams.append('hide', hide)
    }

    if (show_icons) {
      url.searchParams.append('show_icons', show_icons)
    }

    if (include_all_commits) {
      url.searchParams.append('include_all_commits', include_all_commits)
    }

    if (count_private) {
      url.searchParams.append('count_private', count_private)
    }

    // Fetch data from the GitHub README Stats service
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'lst97-dev-website',
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub README Stats service returned ${response.status}`)
    }

    // Get the content type from the original response
    const contentType = response.headers.get('content-type')

    // For SVG responses, we return the raw SVG with appropriate headers
    if (contentType?.includes('image/svg+xml')) {
      return new NextResponse(response.body, {
        status: HttpStatus.OK,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': CACHE_CONTROL.MEDIUM, // Cache for 5 minutes
        },
      })
    }

    // For JSON responses, we use our standardized format
    const data = await response.json()
    return NextResponse.json(createSuccessResponse(data), {
      status: HttpStatus.OK,
      headers: {
        'Cache-Control': CACHE_CONTROL.MEDIUM,
      },
    })
  } catch (error) {
    console.error('Error fetching GitHub stats:', error)
    return NextResponse.json(
      createErrorResponse('GITHUB_API_ERROR', 'Failed to fetch GitHub stats'),
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    )
  }
}
