# AI Chat API Endpoint

This API endpoint handles AI chat requests by validating input, sanitizing for XSS prevention, and proxying requests to an n8n webhook.

## Setup

### Environment Variables

```bash
AI_CHAT_JWT_SECRET=your-jwt-secret-here
N8N_WEBHOOK_URL=https://n8n.lst97.dev/webhook
```

### Dependencies

- `zod` - Schema validation and type safety
- `jsonwebtoken` - JWT authentication
- `dompurify` - HTML sanitization and XSS prevention
- `jsdom` - Server-side DOM environment for DOMPurify

## Request Format

```typescript
POST /api/ai-chat
Content-Type: application/json

{
  "message": "Your chat message here"
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "reply": "AI response message",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Security Features

### Input Sanitization

The API uses **DOMPurify** and custom filters to prevent XSS attacks and prompt injection:

#### XSS Protection (DOMPurify)

- Removes all HTML tags and attributes
- Forbids script, style, iframe, object, embed tags
- Sanitizes dangerous content while preserving text
- Removes null bytes and control characters

#### Prompt Injection Protection

- Detects and neutralizes instruction manipulation attempts
- Blocks role-playing and system prompt override attempts
- Filters jailbreak patterns (DAN mode, developer mode, etc.)
- Removes code execution attempts (```code blocks, eval, exec)
- Prevents prompt leaking attempts
- Neutralizes excessive repetition and special characters
- Limits input to 2000 characters

### JWT Authentication

Requests to the n8n webhook are authenticated using JWT tokens with:

- 5-minute expiration
- HS256 algorithm
- Issued at (iat) and expiration (exp) claims

## n8n Webhook Integration

### Expected n8n Webhook URL

The webhook should be accessible at: `${N8N_WEBHOOK_URL}/ai-chat`

### Payload Sent to n8n

```json
{
  "input": "sanitized user message",
  "ip": "client IP address",
  "useragent": "client user agent",
  "timezone": "client timezone"
}
```

### Expected n8n Response

The API can handle multiple response formats from n8n:

**Primary format:**

```json
{
  "output": "AI generated response"
}
```

**Array format:**

```json
[
  {
    "output": "AI generated response"
  }
]
```

**Alternative object formats:**

```json
{
  "response": "AI generated response"
}
// or
{
  "message": "AI generated response"
}
// or
{
  "result": "AI generated response"
}
```

**Plain string format:**

```json
"AI generated response"
```

## Troubleshooting

### Common Issues

1. **"Webhook not registered for GET requests"**
   - Ensure the n8n webhook is configured for POST requests
   - Verify the webhook URL path is correct
   - Check that the webhook is active in n8n

2. **JWT Authentication Failed**
   - Verify `AI_CHAT_JWT_SECRET` environment variable is set
   - Ensure the n8n webhook is configured to accept JWT authentication

3. **Validation Errors**
   - Input exceeds 2000 character limit
   - Input is empty after sanitization
   - Input contains filtered harmful content
   - Missing required fields

4. **n8n Response Format Issues**
   - API automatically handles multiple response formats
   - Falls back to alternative field names (response, message, result)
   - Handles both object and array responses

### Debug Mode

The API logs the following information for debugging:

- Full webhook URL being called
- Payload being sent to n8n
- n8n response status and error details

## Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `CONFIG_ERROR` - Missing environment variables
- `AUTH_ERROR` - JWT authentication failed
- `AI_SERVICE_ERROR` - n8n webhook unavailable
- `INVALID_RESPONSE` - Invalid response from n8n
- `AI_CHAT_ERROR` - General processing error
