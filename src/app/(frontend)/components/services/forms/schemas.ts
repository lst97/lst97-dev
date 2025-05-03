import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  budget: z.number().min(0, 'Budget cannot be negative').optional(),
  content: z.string().min(10, 'Message must be at least 10 characters long'),
  source: z.string().min(1, 'Please specify how you found me'),
})

export type ContactFormSchema = z.infer<typeof contactFormSchema>
