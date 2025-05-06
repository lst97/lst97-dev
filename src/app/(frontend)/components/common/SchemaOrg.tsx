'use client'

import { usePathname } from 'next/navigation'

interface SchemaOrgProps {
  title?: string
  description?: string
  canonicalUrl?: string
  imageUrl?: string
  datePublished?: string
  dateModified?: string
  authorName?: string
  authorUrl?: string
  type?: 'WebSite' | 'WebPage' | 'BlogPosting' | 'Person' | 'Organization'
  keywords?: string[]
}

export default function SchemaOrg({
  title = 'LST97 | Full-Stack Developer & Software Engineer',
  description = 'Personal website of Nelson Lai (LST97) - Full-Stack Developer specializing in React, Next.js, and modern web development.',
  canonicalUrl,
  imageUrl,
  datePublished,
  dateModified,
  authorName = 'Nelson Lai',
  authorUrl = 'https://github.com/lst97',
  type = 'WebPage',
  keywords = [],
}: SchemaOrgProps) {
  const pathname = usePathname()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lst97.dev'
  const url = canonicalUrl || `${baseUrl}${pathname}`

  // Create schema.org JSON-LD structured data based on the type
  const generateSchema = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': type,
      url,
      name: title,
      description,
      ...(imageUrl && { image: imageUrl }),
    }

    // Add additional properties based on type
    switch (type) {
      case 'BlogPosting':
        return {
          ...baseSchema,
          headline: title,
          keywords: keywords.join(', '),
          datePublished,
          dateModified: dateModified || datePublished,
          author: {
            '@type': 'Person',
            name: authorName,
            url: authorUrl,
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
            '@id': url,
          },
        }

      case 'Person':
        return {
          ...baseSchema,
          jobTitle: 'Full-Stack Developer',
          sameAs: [
            'https://github.com/lst97',
            // Add other social profiles
          ],
        }

      case 'Organization':
        return {
          ...baseSchema,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/logo.png`,
          },
        }

      default:
        return baseSchema
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchema()) }}
    />
  )
}
