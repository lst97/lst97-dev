'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { FaCheckCircle, FaSpinner, FaUser, FaCommentAlt } from 'react-icons/fa'
import { PixelInput } from '@/frontend/components/ui/Inputs'
import { guestBookFormSchema } from './schemas'
import { ZodError } from 'zod'
import { useCreateGuestBookComment } from '@/app/(frontend)/hooks/api/useGuestBookComments'
import { GuestBookCommentFormData } from '@/app/(frontend)/api/query-functions/guest-book/types'
import Turnstile from '@/frontend/components/security/Turnstile'

interface GuestBookFormProps {
  onSubmit?: (data: GuestBookCommentFormData) => Promise<void>
  isSubmitting?: boolean
  isSuccess?: boolean
}

// Helper function to validate form data with Zod
const validateGuestBookForm = (
  data: GuestBookCommentFormData,
): {
  success: boolean
  errors?: { [key in keyof GuestBookCommentFormData]?: string }
} => {
  try {
    guestBookFormSchema.parse(data)
    return { success: true }
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors: { [key in keyof GuestBookCommentFormData]?: string } = {}

      error.errors.forEach((err) => {
        const field = err.path[0] as keyof GuestBookCommentFormData
        formattedErrors[field] = err.message
      })

      return { success: false, errors: formattedErrors }
    }

    return {
      success: false,
      errors: { comment: 'An unexpected error occurred. Please try again.' },
    }
  }
}

export const GuestBookForm: React.FC<GuestBookFormProps> = ({
  onSubmit,
  isSubmitting: externalIsSubmitting = false,
  isSuccess: externalIsSuccess = false,
}) => {
  const [formData, setFormData] = useState<GuestBookCommentFormData>({
    name: '',
    comment: '',
    turnstileToken: undefined,
  })
  const [formErrors, setFormErrors] = useState<{
    [key in keyof GuestBookCommentFormData]?: string
  }>({})
  const [turnstileError, setTurnstileError] = useState<string | null>(null)

  // Use React Query mutation
  const createCommentMutation = useCreateGuestBookComment()

  // Combine external and mutation states
  const isSubmitting = externalIsSubmitting || createCommentMutation.isPending
  const isSuccess = externalIsSuccess || createCommentMutation.isSuccess

  // Memoize the Turnstile site key to prevent re-renders
  const turnstileSiteKey = useMemo(() => {
    return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (formErrors[name as keyof GuestBookCommentFormData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  // Memoize the Turnstile verify handler to prevent re-renders
  const handleTurnstileVerify = useCallback((token: string) => {
    setFormData((prev) => ({
      ...prev,
      turnstileToken: token,
    }))
    setTurnstileError(null)
  }, [])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check Turnstile verification
    if (!formData.turnstileToken) {
      setTurnstileError('Please complete the security verification.')
      return
    }

    // Validate form data with Zod
    const validationResult = validateGuestBookForm(formData)

    if (!validationResult.success && validationResult.errors) {
      setFormErrors(validationResult.errors)
      return
    }

    // If validation passes, submit the form
    try {
      // Use React Query mutation
      await createCommentMutation.mutateAsync(formData)

      // Call the external onSubmit handler if provided
      if (onSubmit) {
        await onSubmit(formData)
      }

      // Reset form on success
      setFormData({
        name: '',
        comment: '',
        turnstileToken: undefined,
      })
      setFormErrors({})
      setTurnstileError(null)
    } catch (error) {
      console.error('Error submitting comment:', error)
      setFormErrors({
        comment:
          error instanceof Error ? error.message : 'Failed to submit comment. Please try again.',
      })
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {isSuccess ? (
        <div className="flex flex-col items-center gap-8 p-8 mb-12 border-4 border-[#97eb9a] shadow-[8px_8px_0_var(--shadow-color)] font-pixel text-[1.8rem] leading-[1.8] text-center bg-card-background text-text-color transition-all duration-300">
          <FaCheckCircle className="text-[4rem] text-[#97eb9a]" />
          <p className="text-[1.4rem] leading-8">
            Thank you for signing my guest book!
            <br />
            Your message will be published after approval.
            <br />I appreciate you taking the time to leave a comment.
          </p>
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto flex flex-col gap-8">
          <PixelInput
            label="Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Your name"
            error={formErrors.name}
            icon={<FaUser />}
            required
            fullWidth
          />

          {/* Custom textarea */}
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="comment" className="font-pixel text-[1.2rem] text-[var(--color-text)]">
              Your Message <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-6 text-[var(--color-text)] opacity-70 z-10">
                <FaCommentAlt />
              </div>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                required
                className="font-['Press_Start_2P'] text-[1.2rem] p-4 pl-12 border-4 border-[var(--color-border)] bg-[var(--color-hover)] text-[var(--color-text)] transition-all duration-300 shadow-[4px_4px_0_var(--shadow-color)] focus:outline-none focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[6px_6px_0_var(--shadow-color)] resize-vertical min-h-[120px] w-full"
                placeholder="Leave your message here..."
                rows={4}
                maxLength={500}
              />
              {formErrors.comment && (
                <span className="text-[var(--color-error)] text-[1rem] mt-1">
                  {formErrors.comment}
                </span>
              )}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(181, 137, 0, 0.05) 2px, rgba(181, 137, 0, 0.05) 4px)',
                  opacity: 0.5,
                  mixBlendMode: 'overlay',
                }}
              />
            </div>
            <div className="text-right text-xs text-[var(--color-text)] opacity-70">
              {formData.comment.length}/500 characters
            </div>
          </div>

          {/* Turnstile Security Verification */}
          <div id="turnstile-container">
            <Turnstile
              siteKey={turnstileSiteKey}
              onVerify={handleTurnstileVerify}
              action="guest_book_form"
            />
            {turnstileError && (
              <div className="text-[var(--color-error)] text-[1rem] mt-2 text-center">
                {turnstileError}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="font-pixel text-[1.2rem] p-6 bg-[var(--color-button)] text-[var(--color-button-text)] border-4 border-[var(--color-border)] cursor-pointer transition-all duration-300 shadow-[6px_6px_0_var(--shadow-color)] mt-4 w-full hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_var(--shadow-color)] flex items-center justify-center gap-2 disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <FaSpinner className="animate-spin text-[1.8rem]" />
            ) : (
              'Sign Guest Book'
            )}
          </button>

          <p className="text-xs text-[#666] text-center mt-4">
            This form is protected by Cloudflare Turnstile to detect and prevent spam.
          </p>
        </form>
      )}
    </div>
  )
}

export default GuestBookForm
