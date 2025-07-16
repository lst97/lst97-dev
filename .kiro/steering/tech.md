# Technology Stack

## Core Framework & Runtime
- **Next.js 15** with App Router and Turbopack
- **React 19** with latest features
- **TypeScript 5.8+** for type safety
- **Node.js 22.14+ or 24+** runtime
- **pnpm 9/10** as package manager

## Frontend Technologies
- **Tailwind CSS v4** with PostCSS for styling
- **Framer Motion** for animations and transitions
- **Radix UI** components for accessible primitives
- **React Query (TanStack)** for server state management
- **Zustand** for client state management
- **next-themes** for dark/light mode theming

## Backend & Database
- **PayloadCMS 3.47+** as headless CMS
- **PostgreSQL** via Vercel Postgres adapter
- **AWS S3** for media storage
- **Next.js API Routes** for backend functionality

## Security & Validation
- **Cloudflare Turnstile** for spam protection
- **JWT** authentication for AI chat
- **Zod** schemas for input validation
- **DOMPurify** for XSS protection

## AI & External Services
- **Hugging Face Transformers** for AI capabilities
- **n8n webhook** integration for AI chat
- **WakaTime API** for coding statistics
- **Google APIs** for various integrations

## Development Tools
- **ESLint** with Next.js config
- **Prettier** for code formatting
- **Dependency Cruiser** for dependency analysis
- **Docker** for containerized development

## Common Commands

```bash
# Development
pnpm dev              # Start dev server with Turbopack
pnpm devsafe          # Clean start (removes .next cache)

# Building & Production
pnpm build            # Production build with dependency analysis
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
# Prettier runs automatically via IDE integration

# PayloadCMS
pnpm generate:types   # Generate TypeScript types
pnpm generate:importmap # Generate import map
pnpm payload          # PayloadCMS CLI commands

# Docker (Optional)
docker-compose up -d  # Start local services
```

## Build Configuration
- **Turbopack** enabled for faster development builds
- **Webpack** plugins for PostgreSQL native module ignoring
- **Image optimization** with Next.js Image component
- **Bundle analysis** integrated into build process