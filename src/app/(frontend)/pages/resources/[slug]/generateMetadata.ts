import { Metadata } from 'next'
import { Post } from '@/frontend/models/Post'

interface GenerateMetadataProps {
  post: Post | null
  params: Promise<{ slug: string }>
}

export async function generatePostMetadata({
  post,
  params,
}: GenerateMetadataProps): Promise<Metadata> {
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.',
    }
  }

  const slug = (await params).slug

  const baseUrl = process.env.BASE_URL || 'https://lst97.dev'
  const postUrl = `${baseUrl}/pages/resources/${slug}`

  // Extract first 50 words from the content for the description if not provided
  let description = post.description
  if (!description && post.content) {
    try {
      // Simplified approach to extract text from lexical content
      const textContent = JSON.stringify(post.content)
        .replace(/"type":"text","text":"([^"]*)"/g, '$1 ')
        .replace(/[^a-zA-Z0-9\s.,!?-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      // Get first 160 characters as fallback description
      description = textContent.substring(0, 160) + (textContent.length > 160 ? '...' : '')
    } catch (e) {
      description = `Read more about ${post.title} on LST97's blog.`
    }
  }

  // Encode parameters for OG image URL
  const ogImageParams = new URLSearchParams({
    title: post.title,
    description: description.substring(0, 100) + (description.length > 100 ? '...' : ''),
    type: 'article',
  }).toString()

  // Full URL to the dynamic OG image
  const ogImageUrl = `${baseUrl}/api/og?${ogImageParams}`

  return {
    title: post.title,
    description,
    keywords: [...(post.categories || []), ...(post.tags || [])],
    authors: [
      {
        name: post.author?.name || 'Nelson Lai',
        url: 'https://github.com/lst97',
      },
    ],
    openGraph: {
      type: 'article',
      url: postUrl,
      title: post.title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.publishedDate,
      modifiedTime: post.lastUpdatedDate || post.publishedDate,
      authors: ['https://github.com/lst97'],
      section: post.categories?.[0] || 'Blog',
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [ogImageUrl],
      creator: '@lst97',
    },
    alternates: {
      canonical: postUrl,
    },
    other: {
      'article:published_time': post.publishedDate,
      'article:modified_time': post.lastUpdatedDate || post.publishedDate,
      'article:author': 'Nelson Lai',
      'article:section': post.categories?.[0] || 'Blog',
      'article:tag': post.tags?.join(',') || '',
    },
  }
}
