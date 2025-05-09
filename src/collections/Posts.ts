import { LexicalNode } from '@/app/(frontend)/components/common/renderers/lexical/types'
import type { CollectionConfig } from 'payload'
import slugify from 'slugify'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedDate', 'postStatus', 'categories'],
  },
  access: {
    read: () => true,
    create: ({ req }) => {
      return Boolean(req.user && req.user.role === 'admin')
    },
    update: ({ req }) => {
      return Boolean(req.user && req.user.role === 'admin')
    },
    delete: ({ req }) => {
      return Boolean(req.user && req.user.role === 'admin')
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'URL-friendly version of the title (generated automatically if left blank)',
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            // If no slug provided, generate from title
            if (!value && data?.title) {
              return slugify(data.title, {
                lower: true,
                strict: true,
                remove: /[*+~.()'"!:@]/g,
              })
            }

            // If slug is provided, make sure it's properly formatted
            if (value) {
              return slugify(value, {
                lower: true,
                strict: true,
                remove: /[*+~.()'"!:@]/g,
              })
            }

            return value
          },
        ],
      },
      unique: true, // Ensure slugs are unique
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
    },
    {
      name: 'lastUpdatedDate',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'categories',
      type: 'array',
      fields: [
        {
          name: 'category',
          type: 'text',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'postStatus',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featuredPost',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'commentsEnabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'views',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'likes',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'readtime',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Estimated read time in minutes',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ data }) => {
        let wordCount = 0

        // Calculate readtime based on content type
        if (data.content) {
          // Handle Lexical content
          if (data.content.root && data.content.root.children) {
            // Extract text from lexical nodes for word counting
            const extractText = (node: LexicalNode): string => {
              if (node.text) return node.text
              if (!node.children) return ''

              return node.children.map((child: LexicalNode) => extractText(child)).join(' ')
            }

            const allText = data.content.root.children
              .map((node: LexicalNode) => extractText(node))
              .join(' ')
            wordCount = allText.split(/\s+/).filter(Boolean).length || 0
          }
          // Handle legacy rich text content
          else if (Array.isArray(data.content)) {
            wordCount = data.content.reduce((count: number, node: LexicalNode) => {
              if (node.children) {
                return (
                  count +
                  node.children.reduce((sum: number, child: LexicalNode) => {
                    if (typeof child.text === 'string') {
                      return sum + (child.text.split(/\s+/).filter(Boolean).length || 0)
                    }
                    return sum
                  }, 0)
                )
              }
              return count
            }, 0)
          }
        }

        const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))

        return {
          ...data,
          readtime: readTimeMinutes,
        }
      },
    ],
  },
}
