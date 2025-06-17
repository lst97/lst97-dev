import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  UberCommentsResponse,
  UberCommentFormData,
  CreateUberCommentResponse,
} from '@/app/(frontend)/api/query-functions/uber/types'
import { Comment } from '@/frontend/components/uber/types'
import {
  fetchUberComments,
  createUberComment,
} from '@/app/(frontend)/api/query-functions/uber/uber-comments'

// Query Keys
export const uberCommentsKeys = {
  all: ['uber-comments'] as const,
  approved: () => [...uberCommentsKeys.all, 'approved'] as const,
}

/**
 * Hook to fetch approved Uber comments
 * Transforms PayloadCMS response to match the Comment interface
 */
export const useUberComments = () => {
  return useQuery({
    queryKey: uberCommentsKeys.approved(),
    queryFn: () => fetchUberComments(1, 50),
    select: (data: UberCommentsResponse): Comment[] => {
      return data.docs.map((comment) => ({
        id: comment.id,
        customerName: comment.customerName,
        orderType: comment.orderType,
        comment: comment.comment,
        rating: comment.rating,
        date: comment.createdAt,
      }))
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to create a new Uber comment
 * Automatically invalidates the comments query on success
 */
export const useCreateUberComment = () => {
  const queryClient = useQueryClient()

  return useMutation<CreateUberCommentResponse, Error, UberCommentFormData>({
    mutationFn: createUberComment,
    onSuccess: () => {
      // Invalidate and refetch comments after successful creation
      queryClient.invalidateQueries({ queryKey: uberCommentsKeys.approved() })
    },
    onError: (error) => {
      console.error('Failed to create Uber comment:', error)
    },
  })
}

/**
 * Hook to get the loading state of comments
 */
export const useUberCommentsLoading = () => {
  const { isLoading, isFetching, isError } = useUberComments()
  return { isLoading, isFetching, isError }
}

/**
 * Hook to prefetch Uber comments
 * Useful for preloading data before navigation
 */
export const usePrefetchUberComments = () => {
  const queryClient = useQueryClient()

  return () => {
    queryClient.prefetchQuery({
      queryKey: uberCommentsKeys.approved(),
      queryFn: () => fetchUberComments(1, 50),
      staleTime: 5 * 60 * 1000,
    })
  }
}
