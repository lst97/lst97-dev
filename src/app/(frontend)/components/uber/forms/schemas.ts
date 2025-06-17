import { z } from 'zod'

export const uberCommentFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  type: z.enum(['Food Delivery', 'Package Delivery', 'Pack & Deliver'], {
    required_error: 'Please select a delivery type',
  }),
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters long')
    .max(500, 'Comment must be less than 500 characters'),
  rating: z
    .number()
    .min(0, 'Rating must be at least 0')
    .max(5, 'Rating cannot exceed 5')
    .step(0.5, 'Rating must be in 0.5 increments'),
  turnstileToken: z.string().optional(),
})

export type UberCommentFormSchema = z.infer<typeof uberCommentFormSchema>
