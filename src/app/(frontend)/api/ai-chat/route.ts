import { NextRequest, NextResponse } from 'next/server'
import { createSuccessResponse, createErrorResponse, HttpStatus } from '../index'
import jwt from 'jsonwebtoken'
import { chatRequestSchema, n8nPayloadSchema } from './schemas'
import { ZodError } from 'zod'

// Function to verify Turnstile token
async function verifyTurnstileToken(
  token: string,
  clientIP?: string,
): Promise<{ success: boolean; error?: string }> {
  if (!token) {
    return { success: false, error: 'No token provided' }
  }

  const secretKey = process.env.TURNSTILE_SECRET
  if (!secretKey) {
    console.error('❌ TURNSTILE_SECRET environment variable is not set')
    return { success: false, error: 'Server configuration error' }
  }

  try {
    const formData = new URLSearchParams({
      secret: secretKey,
      response: token,
    })

    // Add client IP if available (recommended by Cloudflare)
    if (clientIP) {
      formData.append('remoteip', clientIP)
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })

    if (!response.ok) {
      console.error(`❌ Turnstile API returned ${response.status}: ${response.statusText}`)
      return { success: false, error: 'Verification service error' }
    }

    const result = await response.json()

    if (result.success === true) {
      return { success: true }
    } else {
      // Log specific error codes for debugging
      const errorCodes = result['error-codes'] || []
      console.error('❌ Turnstile verification failed with error codes:', errorCodes)

      // Map common error codes to user-friendly messages
      const errorMessages: { [key: string]: string } = {
        'missing-input-secret': 'Server configuration error',
        'invalid-input-secret': 'Server configuration error',
        'missing-input-response': 'No verification token provided',
        'invalid-input-response': 'Invalid verification token',
        'bad-request': 'Invalid verification request',
        'timeout-or-duplicate': 'Verification expired or already used',
      }

      const userError = errorCodes
        .map((code: string) => errorMessages[code] || 'Verification failed')
        .join(', ')
      return { success: false, error: userError }
    }
  } catch (error) {
    console.error('❌ Turnstile verification error:', error)
    return { success: false, error: 'Network error during verification' }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body using Zod schema
    const rawBody = await request.json()

    // Handle both 'message' and 'input' field names for backwards compatibility
    const inputValue = rawBody.message || rawBody.input
    if (!inputValue) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Either "message" or "input" field is required'),
        { status: HttpStatus.BAD_REQUEST },
      )
    }

    const validatedData = chatRequestSchema.parse({ input: inputValue })

    // Check if this is a command (commands don't require Turnstile verification)
    const isCommand = validatedData.input.startsWith('/')

    // Get client information early for Turnstile verification
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || '127.0.0.1'

    // Verify Turnstile token for non-command messages
    if (!isCommand) {
      const turnstileToken = request.headers.get('x-turnstile-token')

      if (!turnstileToken) {
        return NextResponse.json(
          createErrorResponse('SECURITY_ERROR', 'Security verification required'),
          { status: HttpStatus.UNAUTHORIZED },
        )
      }

      const turnstileResult = await verifyTurnstileToken(turnstileToken, ip)
      if (!turnstileResult.success) {
        console.error('❌ Turnstile verification failed:', turnstileResult.error)
        return NextResponse.json(
          createErrorResponse(
            'SECURITY_ERROR',
            turnstileResult.error || 'Security verification failed',
          ),
          { status: HttpStatus.UNAUTHORIZED },
        )
      }
    }

    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Get timezone from request headers or default to UTC
    const timezone = request.headers.get('x-timezone') || 'UTC'

    // Prepare and validate the payload for n8n
    const n8nPayload = n8nPayloadSchema.parse({
      input: validatedData.input, // Already sanitized by the schema
      ip,
      useragent: userAgent,
      timezone,
    })

    // Check if JWT secret is available
    const jwtSecret = process.env.AI_CHAT_JWT_SECRET
    if (!jwtSecret) {
      console.error('AI_CHAT_JWT_SECRET environment variable is not set')
      return NextResponse.json(
        createErrorResponse('CONFIG_ERROR', 'AI chat service is not properly configured'),
        { status: HttpStatus.INTERNAL_SERVER_ERROR },
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes expiration
      },
      jwtSecret,
      { algorithm: 'HS256' },
    )

    // Check if N8N_WEBHOOK_URL is available
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL environment variable is not set')
      return NextResponse.json(
        createErrorResponse('CONFIG_ERROR', 'Webhook URL is not properly configured'),
        { status: HttpStatus.INTERNAL_SERVER_ERROR },
      )
    }

    // Send request to n8n webhook
    const fullWebhookUrl = `${webhookUrl}/ai-chat`

    const n8nResponse = await fetch(fullWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'lst97-dev-website',
      },
      body: JSON.stringify(n8nPayload),
    })

    // First, get the entire response as raw text to prevent parsing errors on incomplete data.
    const responseText = await n8nResponse.text()

    if (!n8nResponse.ok) {
      console.error(`n8n API error: ${n8nResponse.status} ${n8nResponse.statusText}`)
      console.error('Response text:', responseText)
      return NextResponse.json(
        createErrorResponse('AI_SERVICE_ERROR', `AI service returned status ${n8nResponse.status}`),
        { status: HttpStatus.SERVICE_UNAVAILABLE },
      )
    }

    // Check if response is empty
    if (!responseText || responseText.trim().length === 0) {
      console.error('n8n returned an empty response body')
      console.error('This usually indicates a workflow timeout or error in n8n')
      return NextResponse.json(
        createErrorResponse(
          'AI_SERVICE_ERROR',
          'AI service returned an empty response. This may indicate a timeout or processing error.',
        ),
        { status: HttpStatus.SERVICE_UNAVAILABLE },
      )
    }

    let rawN8nData
    try {
      // Now, safely attempt to parse the text we received.
      rawN8nData = JSON.parse(responseText)
    } catch (error) {
      // If parsing fails, log the exact text that caused the failure.
      console.error('AI chat API error: Failed to parse JSON response from n8n.', error)
      console.error('--- Raw Malformed Response Text from n8n ---')
      console.error(`Response length: ${responseText.length}`)
      console.error(`First 500 chars: ${responseText.substring(0, 500)}`)
      console.error(
        `Last 500 chars: ${responseText.substring(Math.max(0, responseText.length - 500))}`,
      )
      console.error('--- End of Raw Response ---')

      // Return a structured error to the client instead of crashing.
      return NextResponse.json(
        createErrorResponse(
          'AI_SERVICE_ERROR',
          'Received a malformed response from the AI service.',
        ),
        { status: HttpStatus.INTERNAL_SERVER_ERROR },
      )
    }

    // Handle different response formats from n8n
    let aiReply: string

    if (Array.isArray(rawN8nData) && rawN8nData.length > 0) {
      // If n8n returns an array, try to extract the output from the first item
      aiReply = rawN8nData[0]?.output || rawN8nData[0]?.response || ''
    } else if (rawN8nData && typeof rawN8nData === 'object') {
      // Try to validate with the expected schema
      aiReply =
        rawN8nData.output || rawN8nData.response || rawN8nData.message || rawN8nData.result || ''
    } else if (typeof rawN8nData === 'string') {
      // If n8n returns a plain string
      aiReply = rawN8nData
    } else {
      console.error('Unexpected response format from n8n:', rawN8nData)
      throw new Error('Unexpected or empty response format from n8n')
    }

    if (!aiReply || typeof aiReply !== 'string') {
      console.warn(
        'Received valid JSON from n8n, but the "output" field was empty or invalid.',
        rawN8nData,
      )
      aiReply = 'Sorry, I received an empty response from the AI service.'
    }

    // Return the AI response in our standardized format
    return NextResponse.json(
      createSuccessResponse({
        reply: aiReply.trim(),
        timestamp: new Date().toISOString(),
      }),
      { status: HttpStatus.OK },
    )
  } catch (error) {
    console.error('AI chat API error:', error)

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errorMessage = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', `Invalid input: ${errorMessage}`),
        { status: HttpStatus.BAD_REQUEST },
      )
    }

    // Handle JWT errors specifically
    if (error instanceof Error && error.message.includes('jwt')) {
      return NextResponse.json(createErrorResponse('AUTH_ERROR', 'Authentication failed'), {
        status: HttpStatus.UNAUTHORIZED,
      })
    }

    return NextResponse.json(
      createErrorResponse('AI_CHAT_ERROR', 'Failed to process chat request'),
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    )
  }
}
