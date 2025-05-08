import { Post } from '@/app/(frontend)/models/Post'

// Types for the posts by-slug endpoint
export interface PostBySlugResponse {
  data: Post
}
