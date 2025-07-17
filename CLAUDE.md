# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Primary Commands
- `pnpm dev` - Start development server with Turbopack
- `pnpm devsafe` - Clean .next directory and start development server
- `pnpm build` - Build for production (includes dependency checking and graph generation)
- `pnpm lint` - Run ESLint
- `pnpm start` - Start production server

### PayloadCMS Commands
- `pnpm generate:types` - Generate TypeScript types for PayloadCMS collections
- `pnpm generate:importmap` - Generate import map for PayloadCMS
- `pnpm payload` - Run PayloadCMS CLI commands

### Testing
This project does not currently have a test framework configured. When implementing tests, check the README or ask the user for the preferred testing setup.

## Project Architecture

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, Tailwind CSS v4, Framer Motion
- **Backend**: Next.js API Routes, PayloadCMS as headless CMS
- **Database**: PostgreSQL via Vercel Postgres
- **Package Manager**: pnpm (required - do not use npm or yarn)
- **Node Version**: 22.14+ or 24.0+

### Directory Structure
```
src/
├── app/
│   ├── (frontend)/           # Frontend application
│   │   ├── components/       # React components organized by feature
│   │   ├── pages/           # Page components
│   │   ├── api/             # Frontend API routes
│   │   ├── hooks/           # Custom React hooks
│   │   ├── providers/       # React context providers
│   │   └── utils/           # Utility functions
│   └── (payload)/           # PayloadCMS admin and API
├── collections/             # PayloadCMS data models
└── payload.config.ts       # PayloadCMS configuration
```

### Key Components Architecture

#### PayloadCMS Collections
- **Users**: Authentication with role-based access (admin/user)
- **Media**: File uploads with S3 storage
- **Posts**: Blog posts with rich text content
- **GuestBookComments**: Visitor comments with moderation
- **UberComments**: Service reviews with ratings

#### Frontend Components
Components are organized by feature in `src/app/(frontend)/components/`:
- `common/` - Reusable UI components and layouts
- `animation/` - Framer Motion animations
- `games/` - Interactive games (TypoSync, Dino)
- `tools/` - Utility tools (background remover, image converter)
- `guest-book/` - Guest book functionality
- `uber/` - Uber delivery service portfolio
- `welcome/` - Welcome page with AI chat bot

#### Styling System
- **Tailwind CSS v4**: Primary styling framework
- **CSS Modules**: Component-specific styles (use .module.css extension)
- **CSS Variables**: Theme system in globals.css with dark mode support
- **Framer Motion**: Animations and interactions

#### State Management
- **React Context**: Global state management
- **TanStack React Query**: Server state and caching
- **Zustand**: Complex state management where needed
- **React hooks**: Local component state

### API Architecture

#### Frontend API Routes (`src/app/(frontend)/api/`)
- `ai-chat/` - AI chat bot with JWT authentication
- `contact/` - Contact form handling
- `github/` - GitHub API integration
- `wakatime/` - WakaTime code statistics
- `weather/` - Weather data integration
- `query-functions/` - Data fetching utilities

#### PayloadCMS API (`src/app/(payload)/api/`)
- REST API at `/api/[...slug]`
- GraphQL API at `/api/graphql`
- Admin panel at `/admin`

### Security Features
- **Cloudflare Turnstile**: Spam protection
- **JWT Authentication**: AI chat security
- **Input Validation**: Zod schemas for all API inputs
- **XSS Protection**: Input sanitization with DOMPurify

## Development Guidelines

### Code Organization
1. Use TypeScript with explicit typing
2. Group imports: external libraries first, then internal
3. Use barrel exports (`index.ts`) for cleaner imports
4. Keep components focused on single responsibility

### Component Conventions
```tsx
'use client' // For client components

import { ExternalLibrary } from 'external-library'
import { InternalComponent } from '@/frontend/components/common'
import styles from './Component.module.css'

interface ComponentProps {
  // Explicit prop types
}

export default function Component({ prop }: ComponentProps) {
  // Component logic
}
```

### Styling Approach
1. Use Tailwind utility classes for standard styling
2. Use CSS modules for component-specific styles
3. Follow theme system for colors and spacing
4. Use CSS variables for consistent theming

### Animation Patterns
- Use Framer Motion for page transitions and interactions
- Common patterns: `initial`, `animate`, `transition`, `whileHover`
- Implement scroll-based animations with `useScroll` and `useTransform`

### Performance Optimization
- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect/useMemo
- Use Next.js Image component for optimized images
- Implement code splitting via dynamic imports

## Environment Setup

### Required Environment Variables
```bash
# Database
POSTGRES_URL=your_database_url

# PayloadCMS
PAYLOAD_SECRET=your_payload_secret

# Security
TURNSTILE_SECRET_KEY=your_turnstile_secret
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key

# S3 Storage
S3_BUCKET=your_s3_bucket
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_REGION=your_region

# AI Chat (Optional)
AI_CHAT_JWT_SECRET=your_jwt_secret
N8N_WEBHOOK_URL=your_n8n_webhook_url
```

### Docker Development
- Use `docker-compose up -d` for local PostgreSQL
- Update `POSTGRES_URL` in .env for Docker setup

## Special Features

### AI Chat Bot (Nelson)
- Terminal-style interface in `/welcome`
- JWT authentication with Turnstile verification
- Markdown response support
- Command system with help utilities

### Interactive Games
- **TypoSync**: Rhythm-based typing game with audio analysis
- **Dino Game**: Chrome dinosaur game recreation

### Developer Tools
- **Background Remover**: AI-powered image background removal
- **Image Converter**: Multi-format image conversion
- **File Type Detector**: Advanced file type detection

### Portfolio Features
- **Guest Book**: Visitor comment system with moderation
- **Uber Portfolio**: Delivery service showcase with reviews
- **GitHub Integration**: Real-time repository statistics
- **WakaTime Integration**: Coding activity visualization

## Build Process

The build command includes:
1. Dependency checking with depcheck
2. Dependency graph generation with dependency-cruiser
3. Next.js production build
4. Type checking and optimization

## Important Notes

- Always use pnpm for package management
- PayloadCMS admin panel is at `/admin`
- Frontend routes are under the `(frontend)` route group
- All API routes include proper error handling and validation
- Images are optimized using Next.js Image component with Sharp
- The project uses Node.js 22.14+ or 24.0+ with specific pnpm build dependencies