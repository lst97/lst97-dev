'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { FaCheckCircle, FaSpinner, FaUser, FaCommentAlt, FaStar, FaRegStar } from 'react-icons/fa'
import { PixelInput, PixelSelect } from '@/frontend/components/ui/Inputs'
import { uberCommentFormSchema } from './schemas'
import { ZodError } from 'zod'
import { useCreateUberComment } from '@/app/(frontend)/hooks/api/useUberComments'
import { UberCommentFormData } from '@/app/(frontend)/api/query-functions/uber/types'
import Turnstile from '@/frontend/components/security/Turnstile'

interface UberCommentFormProps {
  onSubmit: (data: UberCommentFormData) => Promise<void>
  isSubmitting?: boolean
  isSuccess?: boolean
}

// Star Rating Component
const StarRating: React.FC<{
  rating: number
  onRatingChange: (rating: number) => void
  error?: string
}> = ({ rating, onRatingChange, error }) => {
  const [hoverRating, setHoverRating] = useState(0)

  const handleStarClick = (starRating: number) => {
    onRatingChange(starRating)
  }

  const handleStarHover = (starRating: number) => {
    setHoverRating(starRating)
  }

  const handleMouseLeave = () => {
    setHoverRating(0)
  }

  const renderStar = (starIndex: number) => {
    const starValue = starIndex + 0.5
    const fullStarValue = starIndex + 1
    const currentRating = hoverRating || rating

    return (
      <div key={starIndex} className="relative inline-block">
        {/* Half star (left side) */}
        <button
          type="button"
          className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer"
          onClick={() => handleStarClick(starValue)}
          onMouseEnter={() => handleStarHover(starValue)}
          onMouseLeave={handleMouseLeave}
        >
          <span className="sr-only">{starValue} stars</span>
        </button>

        {/* Full star (right side) */}
        <button
          type="button"
          className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer"
          onClick={() => handleStarClick(fullStarValue)}
          onMouseEnter={() => handleStarHover(fullStarValue)}
          onMouseLeave={handleMouseLeave}
        >
          <span className="sr-only">{fullStarValue} stars</span>
        </button>

        {/* Star icon */}
        {currentRating >= fullStarValue ? (
          <FaStar className="text-accent-color text-2xl transition-colors duration-200" />
        ) : currentRating >= starValue ? (
          <div className="relative">
            <FaRegStar className="text-accent-color text-2xl" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <FaStar className="text-accent-color text-2xl" />
            </div>
          </div>
        ) : (
          <FaRegStar className="text-accent-color text-2xl opacity-50 hover:opacity-75 transition-opacity duration-200" />
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="font-pixel text-[1.2rem] text-[var(--color-text)]">
        Rating <span className="text-red-500">*</span>
      </label>
      <div
        className="flex gap-1 items-center p-4 border-4 border-[var(--color-border)] bg-[var(--color-hover)] transition-all duration-300 shadow-[4px_4px_0_var(--shadow-color)] focus-within:outline-none focus-within:-translate-x-0.5 focus-within:-translate-y-0.5 focus-within:shadow-[6px_6px_0_var(--shadow-color)]"
        onMouseLeave={handleMouseLeave}
      >
        {[0, 1, 2, 3, 4].map(renderStar)}
        <span className="ml-4 font-pixel text-sm text-[var(--color-text)]">
          {rating > 0 ? `${rating}/5` : 'Select rating'}
        </span>
      </div>
      {error && <span className="text-[var(--color-error)] text-[1rem] mt-1">{error}</span>}
    </div>
  )
}

// Helper function to validate form data with Zod
const validateUberCommentForm = (
  data: UberCommentFormData,
): {
  success: boolean
  errors?: { [key in keyof UberCommentFormData]?: string }
} => {
  try {
    uberCommentFormSchema.parse(data)
    return { success: true }
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors: { [key in keyof UberCommentFormData]?: string } = {}

      error.errors.forEach((err) => {
        const field = err.path[0] as keyof UberCommentFormData
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

export const UberCommentForm: React.FC<UberCommentFormProps> = ({
  onSubmit,
  isSubmitting: externalIsSubmitting = false,
  isSuccess: externalIsSuccess = false,
}) => {
  const [formData, setFormData] = useState<UberCommentFormData>({
    name: '',
    type: '',
    comment: '',
    rating: 0,
    turnstileToken: undefined,
  })
  const [formErrors, setFormErrors] = useState<{ [key in keyof UberCommentFormData]?: string }>({})
  const [turnstileError, setTurnstileError] = useState<string | null>(null)

  // Use React Query mutation
  const createCommentMutation = useCreateUberComment()

  // Combine external and mutation states
  const isSubmitting = externalIsSubmitting || createCommentMutation.isPending
  const isSuccess = externalIsSuccess || createCommentMutation.isSuccess

  // Memoize the Turnstile site key to prevent re-renders
  const turnstileSiteKey = useMemo(() => {
    return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''
  }, [])

  const deliveryTypes = useMemo(
    () => [
      { value: 'Food Delivery', label: 'Food Delivery' },
      { value: 'Package Delivery', label: 'Package Delivery' },
      { value: 'Pack & Deliver', label: 'Pack & Deliver' },
    ],
    [],
  )

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (formErrors[name as keyof UberCommentFormData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
    }))

    // Clear error when user selects
    if (formErrors.type) {
      setFormErrors((prev) => ({
        ...prev,
        type: undefined,
      }))
    }
  }

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({
      ...prev,
      rating,
    }))

    // Clear error when user rates
    if (formErrors.rating) {
      setFormErrors((prev) => ({
        ...prev,
        rating: undefined,
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
    const validationResult = validateUberCommentForm(formData)

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
        type: '',
        comment: '',
        rating: 0,
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
            Thank you for your review!
            <br />
            Your feedback helps me improve my service.
            <br />
            Your review will be published after approval.
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
            required
            placeholder="Your name"
            error={formErrors.name}
            icon={<FaUser />}
            fullWidth
          />

          <PixelSelect
            label="Delivery Type"
            id="type"
            options={deliveryTypes}
            value={formData.type}
            onChange={handleSelectChange}
            error={formErrors.type}
            placeholder="Select delivery type"
            fullWidth
          />

          <StarRating
            rating={formData.rating}
            onRatingChange={handleRatingChange}
            error={formErrors.rating}
          />

          {/* Custom textarea */}
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="comment" className="font-pixel text-[1.2rem] text-[var(--color-text)]">
              Your Experience <span className="text-red-500">*</span>
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
                placeholder="Tell me about your experience with me..."
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
              action="uber_comment_form"
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
            {isSubmitting ? <FaSpinner className="animate-spin text-[1.8rem]" /> : 'Submit Review'}
          </button>

          <p className="text-xs text-[#666] text-center mt-4">
            This form is protected by Cloudflare Turnstile to detect and prevent spam.
          </p>
        </form>
      )}
    </div>
  )
}

export default UberCommentForm
