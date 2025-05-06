# Contact Form API Endpoint

This API endpoint handles contact form submissions and sends emails using NodeMailer.

## Setup Instructions

1. Install required dependencies:

   ```bash
   pnpm add nodemailer
   pnpm add -D @types/nodemailer
   ```

2. Create a Gmail App Password:
   - Go to your Google Account settings
   - Navigate to Security > App passwords
   - Generate a new app password for "Mail" and your app name

3. Set environment variables in your `.env` file:

   ```txt
   EMAIL_USER=your-email@gmail.com
   EMAIL_APP_PASSWORD=your-app-password
   EMAIL_RECIPIENT=recipient-email@example.com
   RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
   ```

4. Uncomment the NodeMailer code in `route.ts` after setting up the environment variables.

## Usage

Send a POST request to this endpoint with the following data structure:

```json
{
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "budget": "5000-10000",
    "content": "I'm interested in your services...",
    "source": "Google",
    "recaptchaToken": "verified-recaptcha-token"
  }
}
```

## Response Format

Success:

```json
{
  "success": true,
  "message": "Message sent successfully!"
}
```

Error:

```json
{
  "success": false,
  "error": "Error message details"
}
``` 