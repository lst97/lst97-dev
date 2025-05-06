import { NextRequest, NextResponse } from 'next/server'
import { createSuccessResponse, createErrorResponse, HttpStatus } from '../index'
// import nodemailer from 'nodemailer'

interface ContactSubmission {
  name: string
  email: string
  budget: string
  content: string
  source: string
  recaptchaToken: string
}

// Function to verify reCAPTCHA token
async function verifyRecaptchaToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secret}&response=${token}`,
    })

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json()
    const { name, email, budget, content, source, recaptchaToken } = data as ContactSubmission

    // Validate required fields
    if (!name || !email || !content) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Name, email, and message are required fields'),
        { status: HttpStatus.BAD_REQUEST },
      )
    }

    // Validate reCAPTCHA
    const isRecaptchaValid = await verifyRecaptchaToken(recaptchaToken)
    if (!isRecaptchaValid) {
      return NextResponse.json(
        createErrorResponse('RECAPTCHA_ERROR', 'reCAPTCHA verification failed'),
        { status: HttpStatus.BAD_REQUEST },
      )
    }

    // NodeMailer setup (commented out until app password is set up)
    /*
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECIPIENT || process.env.EMAIL_USER,
      subject: `Website Contact Form: ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Budget: ${budget || 'Not specified'}
        Referral Source: ${source || 'Not specified'}
        
        Message:
        ${content}
      `,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Budget:</strong> ${budget || 'Not specified'}</p>
        <p><strong>Referral Source:</strong> ${source || 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <p>${content.replace(/\n/g, '<br>')}</p>
      `,
    }

    await transporter.sendMail(mailOptions)
    */

    // For now, log the submission and return success
    console.log('Contact form submission:', { name, email, budget, content, source })

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
