import { NextRequest, NextResponse } from 'next/server'

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
    const url = new URL('https://github-readme-stats-lst97.vercel.app/api')
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

    // Return the proxied response with appropriate headers
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': contentType || 'image/svg+xml',
        'Cache-Control': 'public, max-age=600', // Cache for 10 minutes
      },
    })
  } catch (error) {
    console.error('Error fetching GitHub stats:', error)
    return NextResponse.json({ error: 'Failed to fetch GitHub stats' }, { status: 500 })
  }
}
