'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchGuestBookComments,
  createGuestBookComment,
} from '@/app/(frontend)/api/query-functions/guest-book/guest-book'
import { GuestBookCommentFormData } from '@/app/(frontend)/api/query-functions/guest-book/types'

// Query keys
export const guestBookQueryKeys = {
  all: ['guest-book-comments'] as const,
  lists: () => [...guestBookQueryKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...guestBookQueryKeys.lists(), page, limit] as const,
}

/**
 * Hook to fetch guest book comments
 */
export const useGuestBookComments = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: guestBookQueryKeys.list(page, limit),
    queryFn: () => fetchGuestBookComments(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to create a new guest book comment
 */
export const useCreateGuestBookComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentData: GuestBookCommentFormData) => createGuestBookComment(commentData),
    onSuccess: () => {
      // Invalidate and refetch guest book comments
      queryClient.invalidateQueries({
        queryKey: guestBookQueryKeys.all,
      })
    },
    onError: (error) => {
      console.error('Error creating guest book comment:', error)
    },
  })
}
