import { emailStyles } from './styles'

export const generateContactNotificationTemplate = (
  name: string,
  email: string,
  budget: string | undefined,
  content: string,
  source: string | undefined,
) => {
  const currentYear = new Date().getFullYear()

  return {
    subject: `Website Contact Form: ${name}`,
    text: `
Hello,

You've received a new contact form submission from your website:

Name: ${name}
Email: ${email}
Budget: ${budget || 'Not specified'}
Referral Source: ${source || 'Not specified'}

Message:
${content}

This is an automated notification from lst97.dev.
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
  <style>
    ${emailStyles}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Contact Form Submission</h2>
    </div>
    
    <div class="content">
      <p>You've received a new contact form submission from your website:</p>
      
      <table>
        <tr>
          <th>Name</th>
          <td>${name}</td>
        </tr>
        <tr>
          <th>Email</th>
          <td><a href="mailto:${email}">${email}</a></td>
        </tr>
        <tr>
          <th>Budget</th>
          <td>${budget || 'Not specified'}</td>
        </tr>
        <tr>
          <th>Referral Source</th>
          <td>${source || 'Not specified'}</td>
        </tr>
      </table>
      
      <p><strong>Message:</strong></p>
      <div class="message-box">
        ${content.replace(/\n/g, '<br>')}
      </div>
    </div>
    
    <div class="footer">
      <p><small>This is an automated notification from <a href="https://lst97.dev">lst97.dev</a>.</small></p>
      <p><small>&copy; ${currentYear} lst97.dev. All rights reserved.</small></p>
    </div>
  </div>
</body>
</html>
    `,
  }
}
