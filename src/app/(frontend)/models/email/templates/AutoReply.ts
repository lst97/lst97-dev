import { emailStyles } from './styles'

export const generateAutoReplyTemplate = (
  name: string,
  email: string,
  budget?: string,
  content?: string,
) => {
  const currentYear = new Date().getFullYear()

  return {
    subject: 'Thank you for contacting lst97.dev',
    text: `
Hello ${name},

Thank you for reaching out to lst97.dev! I've received your message and will review it shortly.

I typically respond to inquiries within 1-2 business days. If your matter is urgent, please mention that in your message.

Your message details:
Email: ${email}
${budget ? `Budget: ${budget}` : ''}
${content ? `Message: ${content}` : ''}

Best regards,
Nelson Lai
lst97.dev
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank you for contacting lst97.dev</title>
  <style>
    ${emailStyles}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Thank You for Contacting lst97.dev</h2>
    </div>
    
    <div class="content">
      <p>Hello ${name},</p>
      
      <p>Thank you for reaching out to lst97.dev! I've received your message and will review it shortly.</p>
      
      <p>I typically respond to inquiries within 1-2 business days. If your matter is urgent, please mention that in your message.</p>
      
      ${
        budget || content
          ? `
      <p><strong>Your message details:</strong></p>
      <table>
        <tr>
          <th>Email</th>
          <td>${email}</td>
        </tr>
        ${
          budget
            ? `
        <tr>
          <th>Budget</th>
          <td>${budget}</td>
        </tr>
        `
            : ''
        }
        ${
          content
            ? `
        <tr>
          <th>Message</th>
          <td class="message-box">${content.replace(/\n/g, '<br>')}</td>
        </tr>
        `
            : ''
        }
      </table>
      `
          : ''
      }
    </div>
    
    <div class="footer">
      <p>Best regards,<br>
      Nelson Lai<br>
      <a href="https://lst97.dev">lst97.dev</a></p>
      
      <p><small>&copy; ${currentYear} lst97.dev. All rights reserved.</small></p>
    </div>
  </div>
</body>
</html>
    `,
  }
}
