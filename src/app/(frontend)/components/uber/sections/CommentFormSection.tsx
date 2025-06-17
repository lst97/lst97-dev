import React, { useState } from 'react'
import UberCommentForm from '../forms/UberCommentForm'

interface UberCommentFormData {
  name: string
  type: string
  comment: string
  rating: number
}

/**
 * Section component for the comment form.
 */
const CommentFormSection: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleCommentSubmit = async (data: UberCommentFormData) => {
    setIsSubmitting(true)

    try {
      // Simulate API call - replace with actual API integration
      console.log('Submitting comment:', data)

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // For now, just log the data and show success
      // TODO: Replace with actual API call
      // const response = await fetch('/api/uber-comments', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(data),
      // })

      // if (!response.ok) {
      //   throw new Error('Failed to submit comment')
      // }

      setIsSuccess(true)

      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSuccess(false)
      }, 5000)
    } catch (error) {
      console.error('Error submitting comment:', error)
      throw error // Re-throw to let the form handle the error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mb-16" id="comment-form">
      <h2 className="leading-16 font-['Press_Start_2P'] text-[3rem] text-text-color drop-shadow-[3px_3px_0_var(--text-shadow-color)] mb-12 text-center relative after:content-[''] after:absolute after:bottom-[-1rem] after:left-1/2 after:-translate-x-1/2 after:w-[100px] after:h-1 after:bg-[repeating-linear-gradient(45deg,var(--border-color)_0,var(--border-color)_4px,transparent_4px,transparent_8px)]">
        Share Your Experience
      </h2>

      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <p className="font-pixel text-lg text-text-color leading-relaxed max-w-4xl mx-auto">
            Had a delivery with me? I&apos;d love to hear about your experience! Your feedback helps
            me continue providing excellent service.
          </p>
        </div>

        <UberCommentForm
          onSubmit={handleCommentSubmit}
          isSubmitting={isSubmitting}
          isSuccess={isSuccess}
        />

        {/* API Integration Notice */}
        <div className="mt-8 border-4 border-border p-6 bg-amber-100 shadow-[4px_4px_0_var(--shadow-color)] max-w-4xl mx-auto text-center">
          <h3 className="font-['Press_Start_2P'] text-[1.2rem] text-text-color mb-3">
            🔧 Development Note
          </h3>
          <p className="font-pixel text-sm text-text-color leading-relaxed">
            This form is currently in development mode. Comments are logged to the console for
            testing. The API integration will be implemented to store and display real customer
            reviews.
          </p>
        </div>
      </div>
    </section>
  )
}

export default CommentFormSection
