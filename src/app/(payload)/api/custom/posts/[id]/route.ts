import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Post as PayloadPost } from '@/payload-types'
import { PostByIdResponse } from './types'
import { Post } from '@/app/(frontend)/models/Post'

// GET /api/custom/posts/[id]
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config })

    const { id } = await params
    const post = (await payload.findByID({
      collection: 'posts',
      id,
    })) as PayloadPost

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Map the response to match our frontend model
    const mappedPost: Post = {
      id: post.id,
      documentId: post.id,
      title: post.title,
      slug: post.slug,
      description: post.description,
      publishedDate: post.publishedDate,
      lastUpdatedDate: post.lastUpdatedDate,
      // Ensure content is properly formatted as LexicalContent
      content: post.content || { root: { type: 'root', children: [], direction: null } },
      featuredImage:
        typeof post.featuredImage === 'object' && post.featuredImage
          ? post.featuredImage.url
          : null,
      categories: post.categories?.map((cat) => cat.category) || [],
      tags: post.tags?.map((tag) => tag.tag) || [],
      views: post.views || 0,
      likes: post.likes || 0,
      readtime: post.readtime || 5,
      featuredPost: post.featuredPost || false,
      postStatus: post.postStatus,
      commentsEnabled: post.commentsEnabled || true,
      author: {
        id: typeof post.author === 'object' ? post.author.id : post.author,
        name: typeof post.author === 'object' ? post.author.email : 'Unknown Author',
      },
    }

    const response: PostByIdResponse = { data: mappedPost }

    // Update view count in a separate try-catch block to prevent it from breaking the entire request
    // TODO: Require a separate endpoint for updating view count for security reasons. (only admins can update documents)
    // try {
    //   if (post.id) {
    //     // Use setTimeout to make this non-blocking
    //     setTimeout(async () => {
    //       try {
    //         await payload.update({
    //           collection: 'posts',
    //           id: post.id,
    //           data: {
    //             views: (post.views || 0) + 1,
    //           },
    //         })
    //       } catch (updateError) {
    //         console.error('Error updating view count:', updateError)
    //       }
    //     }, 0)
    //   }
    // } catch (viewCountError) {
    //   console.error('Error setting up view count update:', viewCountError)
    //   // Continue with the request even if view count update fails
    // }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}
