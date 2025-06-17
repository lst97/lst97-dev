import type { CollectionConfig } from 'payload'

export const UberComments: CollectionConfig = {
  slug: 'uber-comments',
  admin: {
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'orderType', 'rating', 'status', 'createdAt'],
    group: 'Uber Delivery',
  },
  access: {
    read: ({ req }) => {
      // Only admins can read all comments (approved, pending, rejected)
      if (req.user && req.user.role === 'admin') {
        return true
      }
      // Anonymous users can only read approved comments
      return {
        status: {
          equals: 'approved',
        },
      }
    },
    create: () => true, // Anyone can create comments
    update: ({ req }) => {
      return Boolean(req.user && req.user.role === 'admin')
    },
    delete: ({ req }) => {
      return Boolean(req.user && req.user.role === 'admin')
    },
  },
  fields: [
    {
      name: 'customerName',
      type: 'text',
      required: true,
      maxLength: 100,
    },
    {
      name: 'orderType',
      type: 'select',
      options: [
        { label: 'Food Delivery', value: 'Food Delivery' },
        { label: 'Package Delivery', value: 'Package Delivery' },
        { label: 'Pack & Deliver', value: 'Pack & Deliver' },
      ],
      required: true,
    },
    {
      name: 'comment',
      type: 'textarea',
      required: true,
      maxLength: 500,
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 0.5,
      max: 5,
      admin: {
        step: 0.5,
        description: 'Rating from 0.5 to 5 stars (half-star increments)',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending Review', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      defaultValue: 'pending',
      required: true,
      access: {
        // Only admins can update the status
        update: ({ req }) => Boolean(req.user && req.user.role === 'admin'),
      },
      admin: {
        position: 'sidebar',
        description: 'Comments must be approved to appear on the website (admin only)',
      },
    },
    {
      name: 'moderatorNotes',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'Internal notes for moderation (not visible to public)',
      },
    },
    {
      name: 'turnstileToken',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Turnstile verification token (for spam prevention)',
      },
    },
    {
      name: 'turnstileVerified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Whether Turnstile verification was successful',
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'IP address of the commenter (for spam prevention)',
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Browser user agent (for spam prevention)',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        // For new comments, always set status to pending
        if (operation === 'create') {
          data.status = 'pending'
        }

        // Capture IP and User Agent for new comments
        if (req && !data.id) {
          // Admins do not need Turnstile verification but still need approval
          if (req.user && req.user.role === 'admin') {
            return { ...data, turnstileVerified: true } // Mark as verified for admin submissions
          }

          let turnstileVerified = false

          // Verify Turnstile token for new comments
          if (data.turnstileToken) {
            try {
              const turnstileResponse = await fetch(
                'https://challenges.cloudflare.com/turnstile/v0/siteverify',
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: new URLSearchParams({
                    secret: process.env.TURNSTILE_SECRET || '',
                    response: data.turnstileToken,
                    remoteip:
                      req.headers.get('x-forwarded-for') ||
                      req.headers.get('x-real-ip') ||
                      'unknown',
                  }),
                },
              )

              const turnstileResult = await turnstileResponse.json()

              turnstileVerified = turnstileResult.success === true

              if (!turnstileVerified) {
                throw new Error('Turnstile verification failed. Please try again.')
              }
            } catch (error) {
              console.error('Turnstile verification error:', error)
              throw new Error('Security verification failed. Please try again.')
            }
          } else {
            throw new Error('Security verification is required.')
          }

          return {
            ...data,
            ipAddress:
              req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
            userAgent: req.headers.get('user-agent') || 'unknown',
            turnstileVerified,
          }
        }
        return data
      },
    ],
  },
}
