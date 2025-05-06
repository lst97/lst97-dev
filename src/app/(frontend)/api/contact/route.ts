import { NextRequest, NextResponse } from 'next/server'
import { createSuccessResponse, createErrorResponse, HttpStatus } from '../index'
import { verifyTurnstileToken } from '../utils'
import { EmailService } from '@/frontend/services'

interface ContactSubmission {
  name: string
  email: string
  budget: string
  content: string
  source: string
  turnstileToken: string
}

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json()
    const { name, email, budget, content, source, turnstileToken } = data as ContactSubmission

    // Validate required fields
    if (!name || !email || !content) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Name, email, and message are required fields'),
        { status: HttpStatus.BAD_REQUEST },
      )
    }

    // Validate Turnstile
    const isTurnstileValid = await verifyTurnstileToken(turnstileToken)
    if (!isTurnstileValid) {
      return NextResponse.json(
        createErrorResponse('TURNSTILE_ERROR', 'Turnstile verification failed'),
        { status: HttpStatus.BAD_REQUEST },
      )
    }

    // Send email notification to admin
    try {
      await EmailService.sendContactNotification(name, email, budget, content, source)

      // Send auto-reply to the sender
      await EmailService.sendAutoReply(name, email, budget, content)
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // Continue execution but log the error - don't fail the submission due to email issues
    }

    // Store in database if needed
    // const result = await db.contactSubmissions.create({ data: ... })

    return NextResponse.json(createSuccessResponse({ message: 'Message sent successfully!' }), {
      status: HttpStatus.OK,
    })
  } catch (error) {
    console.error('Contact form submission error:', error)
    return NextResponse.json(
      createErrorResponse('CONTACT_FORM_ERROR', 'Failed to process contact form submission'),
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    )
  }
}
