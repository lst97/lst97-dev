import { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

type SitemapFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.BASE_URL || 'https://lst97.dev'

  // Define static routes
  const routes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as SitemapFrequency,
      priority: 1,
    },
    {
      url: `${baseUrl}/pages/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as SitemapFrequency,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pages/projects`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as SitemapFrequency,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pages/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as SitemapFrequency,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pages/resources`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as SitemapFrequency,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pages/welcome`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as SitemapFrequency,
      priority: 0.5,
    },
  ]

  // Get dynamic routes from blog posts
  try {
    const payload = await getPayload({ config })

    const posts = await payload.find({
      collection: 'posts',
      where: {
        postStatus: {
          equals: 'published',
        },
      },
      limit: 100,
    })

    const postRoutes = posts.docs.map((post) => ({
      url: `${baseUrl}/pages/resources/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.createdAt),
      changeFrequency: 'weekly' as SitemapFrequency,
      priority: 0.6,
    }))

    return [...routes, ...postRoutes]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return routes
  }
}
