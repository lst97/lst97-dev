import React from 'react'
import { FaStar, FaStarHalfAlt, FaRegStar, FaThumbsUp, FaSpinner } from 'react-icons/fa'
import { Comment } from '../types'
import { useUberComments } from '@/app/(frontend)/hooks/api/useUberComments'

/**
 * Props for the CommentsSection component.
 */
interface CommentsSectionProps {
  /** An array of comment objects to display (optional - will fetch from API if not provided). */
  comments?: Comment[]
}

/**
 * Component to render star rating
 */
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`full-${i}`} className="text-accent-color text-lg" />)
  }

  // Half star
  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" className="text-accent-color text-lg" />)
  }

  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FaRegStar key={`empty-${i}`} className="text-accent-color text-lg" />)
  }

  return <div className="flex gap-1">{stars}</div>
}

/**
 * Section component displaying customer comments and reviews.
 * Uses TanStack React Query to fetch data from PayloadCMS.
 */
const CommentsSection: React.FC<CommentsSectionProps> = ({ comments: propComments }) => {
  // Use React Query to fetch comments if not provided via props
  const { data: fetchedComments, isLoading, isError, error } = useUberComments()

  // Use prop comments if provided, otherwise use fetched comments
  const comments = propComments || fetchedComments || []
  const loading = propComments ? false : isLoading
  const hasError = propComments ? false : isError

  // Calculate average rating (for future use)
  const _averageRating =
    comments.length > 0
      ? comments.reduce((sum: number, comment: Comment) => sum + comment.rating, 0) /
        comments.length
      : 0

  const _averagePercentage = Math.round((_averageRating / 5) * 100)

  return (
    <section className="mb-16" id="comments">
      <h2 className="leading-16 font-['Press_Start_2P'] text-[3rem] text-text-color drop-shadow-[3px_3px_0_var(--text-shadow-color)] mb-12 text-center relative after:content-[''] after:absolute after:bottom-[-1rem] after:left-1/2 after:-translate-x-1/2 after:w-[100px] after:h-1 after:bg-[repeating-linear-gradient(45deg,var(--border-color)_0,var(--border-color)_4px,transparent_4px,transparent_8px)]">
        Customer Reviews
      </h2>

      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <p className="font-pixel text-lg text-text-color leading-relaxed max-w-4xl mx-auto">
            Here&apos;s what customers say about my delivery service. Every review represents my
            commitment to excellence.
          </p>
        </div>

        {/* Overall Rating Summary */}
        <div className="border-4 border-border p-12 bg-card-background shadow-[8px_8px_0_var(--shadow-color)] mb-12 max-w-2xl mx-auto text-center bg-secondary-dark">
          <div className="mb-4">
            <div className="text-success font-['Press_Start_2P'] text-[3rem] text-accent-color mb-2 flex items-center justify-center">
              <FaThumbsUp className="text-success inline-block mr-8 text-6xl" />
              <span className="text-6xl">98%</span>
            </div>
            <p className="font-pixel text-md text-text-color">Average Customer Rating</p>
          </div>
          <div className="border-t-2 border-dashed border-border pt-4">
            <p className="font-pixel text-sm text-text-color">
              Based on 2000+ completed deliveries
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-4xl text-accent-color" />
            <span className="ml-4 font-pixel text-lg text-text-color">Loading reviews...</span>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="border-4 border-red-500 p-8 bg-red-50 shadow-[8px_8px_0_var(--shadow-color)] mb-12 max-w-2xl mx-auto text-center">
            <p className="font-pixel text-lg text-red-600">
              Failed to load reviews: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        )}

        {/* Comments Grid */}
        {!loading && !hasError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {comments.length > 0 ? (
              comments.map((comment: Comment) => (
                <div
                  key={comment.id}
                  className="border-4 border-border p-6 transition-all duration-300 relative shadow-[8px_8px_0_var(--shadow-color)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_var(--shadow-color)] bg-amber-50 before:content-[''] before:absolute before:inset-0 before:border-2 before:border-border before:pointer-events-none after:content-[''] after:absolute after:inset-0 after:bg-dots after:opacity-5 after:pointer-events-none"
                >
                  {/* Customer Info */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-dashed border-border">
                    <div>
                      <h4 className="font-['Press_Start_2P'] text-sm text-text-color mb-1">
                        {comment.customerName}
                      </h4>
                      <div className="font-pixel text-xs text-text-color opacity-70">
                        {comment.orderType}
                      </div>
                    </div>
                    <div className="text-right">
                      <StarRating rating={comment.rating} />
                      <div className="font-pixel text-xs text-text-color opacity-70 mt-1">
                        {new Date(comment.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Comment Text */}
                  <div className="mb-4">
                    <p className="font-pixel text-sm text-text-color leading-relaxed">
                      &ldquo;{comment.comment}&rdquo;
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="font-pixel text-lg text-text-color">
                  No reviews yet. Be the first to leave a review!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default CommentsSection
