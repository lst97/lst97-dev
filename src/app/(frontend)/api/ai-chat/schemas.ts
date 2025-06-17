import { z } from 'zod'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

// Create a DOM environment for server-side DOMPurify
const window = new JSDOM('').window
const purify = DOMPurify(window as unknown as Window & typeof globalThis)

// Prompt injection patterns to detect and neutralize
const PROMPT_INJECTION_PATTERNS = [
  // Direct instruction attempts
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|commands?)/gi,
  /ignore\s+(the\s+)?(previous|above|prior)\s+(instructions?|prompts?|commands?)/gi,
  /forget\s+(everything|all)\s+(above|before|previous)/gi,
  /disregard\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|commands?)/gi,
  /disregard\s+(the\s+)?(previous|above|prior)\s+(instructions?|prompts?|commands?)/gi,

  // Role manipulation attempts
  /you\s+are\s+(now\s+)?(a|an)\s+/gi,
  /act\s+as\s+(a|an)\s+/gi,
  /pretend\s+(to\s+be|you\s+are)\s+/gi,
  /roleplay\s+as\s+/gi,

  // System prompt manipulation
  /system\s*:\s*/gi,
  /assistant\s*:\s*/gi,
  /human\s*:\s*/gi,
  /user\s*:\s*/gi,

  // Jailbreak attempts
  /jailbreak/gi,
  /DAN\s+(mode|prompt)/gi,
  /developer\s+mode/gi,
  /god\s+mode/gi,

  // Instruction termination attempts
  /end\s+of\s+(instructions?|prompts?|commands?)/gi,
  /stop\s+(following|using)\s+(instructions?|prompts?|commands?)/gi,

  // Code execution attempts
  /```[\s\S]*?```/g,
  /<code[\s\S]*?<\/code>/gi,
  /eval\s*\(/gi,
  /exec\s*\(/gi,

  // Prompt leaking attempts
  /what\s+(are\s+)?your\s+(instructions?|prompts?|rules?)/gi,
  /show\s+me\s+your\s+(instructions?|prompts?|rules?)/gi,
  /reveal\s+your\s+(instructions?|prompts?|rules?)/gi,

  // Additional jailbreak patterns
  /break\s+out\s+of\s+character/gi,
  /override\s+(safety|security)\s+(protocols?|measures?)/gi,
  /bypass\s+(restrictions?|limitations?|filters?)/gi,
  /unlimited\s+(mode|access)/gi,
  /unrestricted\s+(mode|access)/gi,
]

// Function to detect and neutralize prompt injection attempts
const neutralizePromptInjection = (input: string): string => {
  let sanitized = input

  // Replace prompt injection patterns with neutral text
  PROMPT_INJECTION_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '[FILTERED]')
  })

  // Remove excessive repetition that might be used for prompt injection
  sanitized = sanitized.replace(/(.{1,50})\1{3,}/gi, '$1')

  // Remove excessive special characters that might be used for prompt breaking
  sanitized = sanitized.replace(/[^\w\s.,!?;:()\-'"]{3,}/g, '')

  // Remove potential prompt separators
  sanitized = sanitized.replace(/[=\-_]{10,}/g, '')

  // Remove potential instruction markers
  sanitized = sanitized.replace(/^\s*(instruction|prompt|command)\s*[:=]\s*/gi, '')

  return sanitized
}

// Function to sanitize input using DOMPurify and prevent prompt injection
const sanitizeInput = (input: string): string => {
  // First, use DOMPurify to remove XSS threats
  const htmlSanitized = purify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
    FORBID_CONTENTS: ['script', 'style'], // Forbid script and style content
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
  })

  // Then neutralize prompt injection attempts
  const promptSanitized = neutralizePromptInjection(htmlSanitized)

  // Final cleanup
  return (
    promptSanitized
      .trim()
      // Remove null bytes and other control characters
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Remove leading/trailing quotes that might be used for prompt injection
      .replace(/^["'`]+|["'`]+$/g, '')
  )
}

// Zod schema for chat request validation
export const chatRequestSchema = z.object({
  input: z
    .string()
    .min(1, 'Input cannot be empty')
    .max(2000, 'Input cannot exceed 2000 characters')
    .transform(sanitizeInput)
    .refine((value) => value.length > 0, {
      message: 'Input cannot be empty after sanitization',
    })
    .refine((value) => !value.includes('[FILTERED]'), {
      message: 'Input contains potentially harmful content that has been filtered',
    }),
})

export type ChatRequest = z.infer<typeof chatRequestSchema>

// Schema for the n8n webhook payload
export const n8nPayloadSchema = z.object({
  input: z.string(),
  ip: z.string(),
  useragent: z.string(),
  timezone: z.string(),
})

export type N8nPayload = z.infer<typeof n8nPayloadSchema>

// Schema for n8n response (primary format)
export const n8nResponseSchema = z.object({
  output: z.string(),
})

// Alternative schemas for different n8n response formats
export const n8nArrayResponseSchema = z.array(
  z.union([
    z.string(),
    z.object({
      output: z.string(),
    }),
  ]),
)

export const n8nAlternativeResponseSchema = z.object({
  response: z.string().optional(),
  message: z.string().optional(),
  result: z.string().optional(),
  output: z.string().optional(),
})

export type N8nResponse = z.infer<typeof n8nResponseSchema>
export type N8nArrayResponse = z.infer<typeof n8nArrayResponseSchema>
export type N8nAlternativeResponse = z.infer<typeof n8nAlternativeResponseSchema>
