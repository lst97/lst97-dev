import { z } from 'zod'

export const guestBookFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters long')
    .max(500, 'Comment must be less than 500 characters'),
  turnstileToken: z.string().optional(),
})

export type GuestBookFormSchema = z.infer<typeof guestBookFormSchema>
