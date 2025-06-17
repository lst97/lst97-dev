import { CollectionConfig } from 'payload'

export const GuestBookComments: CollectionConfig = {
  slug: 'guest-book-comments',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'comment', 'approved', 'createdAt'],
    group: 'Content',
  },
  access: {
    // Anyone can create (for anonymous submissions)
    create: () => true,
    // Only admins can read all comments, anonymous users can only read approved comments
    read: ({ req: { user } }) => {
      if (user) {
        return true // Admins can see all comments (approved and not approved)
      }
      // Anonymous users can only see approved comments
      return {
        approved: {
          equals: true,
        },
      }
    },
    // Only admins can update
    update: ({ req: { user } }) => Boolean(user),
    // Only admins can delete
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // For new comments, always set approved to false initially
        if (operation === 'create') {
          data.approved = false
        }

        // Skip Turnstile verification for admin users
        if (req.user) {
          data.turnstileVerified = true
          // Admin comments still need manual approval
          return data
        }

        // For public submissions, verify Turnstile token
        if (operation === 'create' && data.turnstileToken) {
          try {
            const turnstileResponse = await fetch(
              'https://challenges.cloudflare.com/turnstile/v0/siteverify',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                  secret: process.env.TURNSTILE_SECRET_KEY || '',
                  response: data.turnstileToken,
                }),
              },
            )

            const turnstileResult = await turnstileResponse.json()

            if (turnstileResult.success) {
              data.turnstileVerified = true
            } else {
              throw new Error('Turnstile verification failed')
            }
          } catch (error) {
            throw new Error(`Turnstile verification error: ${error}`)
          }
        } else if (operation === 'create') {
          throw new Error('Turnstile token is required')
        }

        // Remove the token from storage for security
        delete data.turnstileToken

        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 50,
      admin: {
        description: 'Display name for the comment (can be anonymous)',
      },
    },
    {
      name: 'comment',
      type: 'textarea',
      required: true,
      maxLength: 500,
      admin: {
        description: 'The guest book comment content',
      },
    },
    {
      name: 'approved',
      type: 'checkbox',
      defaultValue: false,
      access: {
        // Only admins can update the approved status
        update: ({ req }) => Boolean(req.user),
      },
      admin: {
        position: 'sidebar',
        description: 'Whether this comment is approved for public display (admin only)',
      },
    },
    {
      name: 'turnstileVerified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Whether Turnstile verification passed',
      },
    },
    {
      name: 'turnstileToken',
      type: 'text',
      admin: {
        hidden: true, // Hidden from admin UI
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'IP address of the commenter (for moderation)',
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'User agent of the commenter (for moderation)',
      },
    },
  ],
  timestamps: true,
}
