import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || 'unknown'

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown'

    return NextResponse.json({
      ip,
      userAgent,
    })
  } catch (error) {
    console.error('Error getting client info:', error)
    return NextResponse.json({ error: 'Failed to get client info' }, { status: 500 })
  }
}
