import React from 'react'
import { FaSpinner, FaComments } from 'react-icons/fa'
import { GuestBookComment } from '@/app/(frontend)/api/query-functions/guest-book/types'
import { useGuestBookComments } from '@/app/(frontend)/hooks/api/useGuestBookComments'

/**
 * Props for the CommentsSection component.
 */
interface CommentsSectionProps {
  /** An array of comment objects to display (optional - will fetch from API if not provided). */
  comments?: GuestBookComment[]
}

/**
 * Section component displaying guest book comments.
 * Uses TanStack React Query to fetch data from PayloadCMS.
 */
const CommentsSection: React.FC<CommentsSectionProps> = ({ comments: propComments }) => {
  // Use React Query to fetch comments if not provided via props
  const { data: fetchedComments, isLoading, isError, error } = useGuestBookComments()

  // Use prop comments if provided, otherwise use fetched comments
  const comments = propComments || fetchedComments?.data || []
  const loading = propComments ? false : isLoading
  const hasError = propComments ? false : isError

  return (
    <section className="mb-16" id="comments">
      <h2 className="leading-16 font-['Press_Start_2P'] text-[3rem] text-text-color drop-shadow-[3px_3px_0_var(--text-shadow-color)] mb-12 text-center relative after:content-[''] after:absolute after:bottom-[-1rem] after:left-1/2 after:-translate-x-1/2 after:w-[100px] after:h-1 after:bg-[repeating-linear-gradient(45deg,var(--border-color)_0,var(--border-color)_4px,transparent_4px,transparent_8px)]">
        Guest Book Messages
      </h2>

      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <p className="font-pixel text-lg text-text-color leading-relaxed max-w-4xl mx-auto">
            Messages from visitors who took the time to sign my guest book. Thank you for your kind
            words!
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-4xl text-accent-color" />
            <span className="ml-4 font-pixel text-lg text-text-color">Loading messages...</span>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="border-4 border-red-500 p-8 bg-red-50 shadow-[8px_8px_0_var(--shadow-color)] mb-12 max-w-2xl mx-auto text-center">
            <p className="font-pixel text-lg text-red-600">
              Failed to load messages: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        )}

        {/* Comments Grid */}
        {!loading && !hasError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {comments.length > 0 ? (
              comments.map((comment: GuestBookComment) => (
                <div
                  key={comment.id}
                  className="border-4 border-border p-6 transition-all duration-300 relative shadow-[8px_8px_0_var(--shadow-color)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_var(--shadow-color)] bg-amber-50 before:content-[''] before:absolute before:inset-0 before:border-2 before:border-border before:pointer-events-none after:content-[''] after:absolute after:inset-0 after:bg-dots after:opacity-5 after:pointer-events-none"
                >
                  {/* Comment Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-dashed border-border">
                    <div>
                      <h4 className="font-['Press_Start_2P'] text-sm text-text-color mb-1">
                        {comment.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <div className="font-pixel text-xs text-text-color opacity-70">
                        {new Date(comment.createdAt).toLocaleDateString()}
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
                <div className="border-4 border-border p-8 bg-amber-50 shadow-[8px_8px_0_var(--shadow-color)] max-w-md mx-auto">
                  <FaComments className="text-6xl text-accent-color mx-auto mb-4" />
                  <p className="font-pixel text-lg text-text-color mb-2">No messages yet!</p>
                  <p className="font-pixel text-sm text-text-color opacity-70">
                    Be the first to sign my guest book.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Total Comments Counter */}
        {!loading && !hasError && comments.length > 0 && (
          <div className="text-center">
            <div className="inline-block border-2 border-dashed border-accent-color p-4 bg-amber-100">
              <p className="font-pixel text-sm text-accent-color">
                📝 {comments.length} message{comments.length !== 1 ? 's' : ''} in the guest book
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default CommentsSection
