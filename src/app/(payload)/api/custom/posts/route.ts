import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Post } from '@/payload-types'
import { PostResponse, PostListItem } from './types'

// GET /api/custom/posts
export async function GET() {
  try {
    const payload = await getPayload({ config })

    const posts = await payload.find({
      collection: 'posts',
      limit: 100,
      where: {
        postStatus: {
          equals: 'published',
        },
      },
      sort: '-publishedDate',
      // Only fetch fields needed for the list view
      depth: 1,
    })

    // Map the response to match our frontend model
    const mappedPosts: PostListItem[] = posts.docs.map((post: Post) => ({
      id: post.id,
      documentId: post.id,
      title: post.title,
      slug: post.slug,
      description: post.description,
      publishedDate: post.publishedDate,
      lastUpdatedDate: post.lastUpdatedDate,
      // Content is intentionally excluded in the list view for performance
      content: [], // Empty array instead of full content
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
    }))

    const response: PostResponse = { data: mappedPosts }
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
