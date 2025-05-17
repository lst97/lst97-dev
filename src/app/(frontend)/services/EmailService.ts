import nodemailer from 'nodemailer'
import { getAccessToken } from '@/frontend/utils/oauth2'
import {
  generateAutoReplyTemplate,
  generateContactNotificationTemplate,
} from '@/frontend/models/email/templates'

interface EmailOptions {
  to: string
  subject: string
  text: string
  html: string
}

export class EmailService {
  private static async createTransporter() {
    try {
      const accessToken = await getAccessToken()

      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_USER!,
          clientId: process.env.GOOGLE_OAUTH2_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET!,
          refreshToken: process.env.GOOGLE_OAUTH2_REFRESH_TOKEN!,
          accessToken: accessToken!,
        },
      })
    } catch (error) {
      console.error('Error creating email transporter:', error)
      throw new Error('Failed to create email transporter')
    }
  }

  public static async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const transporter = await this.createTransporter()

      await transporter.sendMail({
        from: `"lst97.dev" <${process.env.EMAIL_USER}>`,
        ...options,
      })
    } catch (error) {
      console.error('Error sending email:', error)
      throw new Error('Failed to send email')
    }
  }

  public static async sendContactNotification(
    name: string,
    email: string,
    budget: string | undefined,
    content: string,
    source: string | undefined,
  ): Promise<void> {
    const template = generateContactNotificationTemplate(name, email, budget, content, source)

    const emailOptions = {
      to: process.env.EMAIL_RECIPIENT || process.env.EMAIL_USER || '',
      subject: template.subject,
      text: template.text,
      html: template.html,
    }

    await EmailService.sendEmail(emailOptions)
  }

  public static async sendAutoReply(
    name: string,
    email: string,
    budget?: string,
    content?: string,
  ): Promise<void> {
    const template = generateAutoReplyTemplate(name, email, budget, content)

    const emailOptions = {
      to: email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    }

    await EmailService.sendEmail(emailOptions)
  }
}
