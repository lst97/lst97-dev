# Project Structure

## Root Directory Organization

```
├── src/                    # Source code
├── public/                 # Static assets
├── docs/                   # Documentation files
├── .cursor/rules/          # Cursor IDE rules
├── .kiro/                  # Kiro steering files
└── [config files]          # Various config files
```

## Source Code Structure (`src/`)

### App Router Layout (`src/app/`)
- **`(frontend)/`** - Main application routes and components
- **`(payload)/`** - PayloadCMS admin panel and API routes

### Frontend Architecture (`src/app/(frontend)/`)

```
├── components/             # React components organized by feature
│   ├── about/             # About page components
│   ├── animation/         # Animation components (Framer Motion)
│   ├── common/            # Shared/reusable components
│   ├── games/             # Interactive games (typo-sync, etc.)
│   ├── guest-book/        # Guest book system
│   ├── landing/           # Landing page sections
│   ├── projects/          # Project showcase components
│   ├── services/          # Services and portfolio components
│   ├── tools/             # Developer tools (bg-remover, file-type, etc.)
│   ├── uber/              # Uber delivery portfolio
│   ├── ui/                # Base UI components (buttons, inputs, etc.)
│   └── welcome/           # Welcome page and AI chat
├── pages/                 # Page-level components
├── api/                   # API routes
├── hooks/                 # Custom React hooks
├── contexts/              # React contexts
├── providers/             # React providers
├── constants/             # Static data and configuration
├── models/                # TypeScript interfaces/types
├── services/              # External service integrations
├── utils/                 # Utility functions
└── styles/                # CSS files and styling
```

### PayloadCMS Structure (`src/app/(payload)/`)
- **`admin/`** - Admin panel configuration
- **`api/`** - PayloadCMS API routes and custom endpoints

### Collections (`src/collections/`)
- **`Users.ts`** - User authentication and roles
- **`Media.ts`** - File uploads and media management
- **`Posts.ts`** - Blog posts and content
- **`GuestBookComments.ts`** - Guest book entries
- **`UberComments.ts`** - Uber delivery reviews

## Component Organization Patterns

### Feature-Based Structure
Components are organized by feature/domain rather than by type:
- Each feature has its own folder (e.g., `guest-book/`, `uber/`)
- Related components, forms, and sections are co-located
- Shared components live in `common/`

### Component Hierarchy
```
feature/
├── index.ts              # Barrel exports
├── FeatureMain.tsx       # Main component
├── components/           # Feature-specific components
├── forms/               # Form components and schemas
├── sections/            # Page sections
├── hooks/               # Feature-specific hooks
└── types.ts             # Feature-specific types
```

## Static Assets (`public/`)

```
├── fonts/                # Custom fonts (Press Start 2P)
├── tech-icons/           # Technology stack icons
├── typo-sync/            # Game assets and audio
├── dino_game/            # Dino game sprites
├── workers/              # Web workers
└── [pixel-art-assets]    # Various pixel art images
```

## Path Aliases

```typescript
"@/*": ["./src/*"]                    # General source alias
"@/frontend/*": ["./src/app/(frontend)/*"]  # Frontend-specific alias
"@payload-config": ["./src/payload.config.ts"]  # PayloadCMS config
```

## Naming Conventions

### Files & Directories
- **PascalCase** for React components (`UserProfile.tsx`)
- **camelCase** for utilities and hooks (`useContactForm.ts`)
- **kebab-case** for directories (`guest-book/`, `bg-remover/`)
- **lowercase** for API routes (`route.ts`)

### Components
- **Functional components** with TypeScript
- **Named exports** preferred over default exports
- **Props interfaces** named as `ComponentNameProps`

### API Routes
- Follow Next.js App Router conventions
- Use `route.ts` for API endpoints
- Organize by feature in nested directories

## Import/Export Patterns

### Barrel Exports
Most feature directories include `index.ts` files for clean imports:
```typescript
// Instead of multiple imports
import { Component1 } from './feature/Component1'
import { Component2 } from './feature/Component2'

// Use barrel export
import { Component1, Component2 } from './feature'
```

### Absolute Imports
Use path aliases for cleaner imports:
```typescript
import { Button } from '@/frontend/components/ui'
import { ContactForm } from '@/frontend/components/services/forms'
```