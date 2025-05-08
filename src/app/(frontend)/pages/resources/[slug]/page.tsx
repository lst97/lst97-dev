import { Metadata } from 'next'
import { Post } from '@/frontend/models/Post'
import { generatePostMetadata } from './generateMetadata'
import dynamic from 'next/dynamic'
import React from 'react'

// Server-side data fetching for the post
async function getPost(slug: string): Promise<Post | null> {
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
    const url = `${baseUrl}/api/custom/posts/by-slug?slug=${encodeURIComponent(slug)}`
    const response = await fetch(url, { next: { revalidate: 3600 } }) // Cache for 1 hour

    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const post = await getPost((await params).slug)
  return generatePostMetadata({ post, params })
}

// JSON-LD structured data for the post
function generateBlogPostStructuredData(post: Post, slug: string) {
  if (!post) return null

  const baseUrl = process.env.BASE_URL || 'https://lst97.dev'
  const postUrl = `${baseUrl}/pages/resources/${slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.featuredImage ? [post.featuredImage] : [],
    datePublished: post.publishedDate,
    dateModified: post.lastUpdatedDate || post.publishedDate,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'Nelson Lai',
      url: 'https://github.com/lst97',
    },
    publisher: {
      '@type': 'Organization',
      name: 'LST97',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    keywords: [...(post.categories || []), ...(post.tags || [])].join(', '),
  }
}

// Loading state component
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh]">
    <div className="animate-spin h-10 w-10 border-4 border-[var(--color-accent)] border-t-transparent rounded-full"></div>
    <div className="mt-4 font-['Press_Start_2P'] text-sm">Loading content...</div>
  </div>
)

// Main component for Server Component
export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug)

  // Create a dynamic client component for the page content
  const ClientResourceContent = dynamic(() => import('./ClientResourceContent'), {
    loading: () => <LoadingState />,
    ssr: true,
  })

  return (
    <>
      {/* Add JSON-LD structured data */}
      {post && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateBlogPostStructuredData(post, (await params).slug)),
          }}
        />
      )}

      {/* Client component wrapper */}
      <ClientResourceContent post={post} slug={(await params).slug} />
    </>
  )
}
