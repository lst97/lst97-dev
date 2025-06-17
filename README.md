# lst97-dev - Personal Website and Portfolio

This project is a personal website and portfolio built with **Next.js 15**, **React 19**, **Tailwind CSS v4**, **Framer Motion** for animations, and **PayloadCMS** as a headless CMS with PostgreSQL database (via Vercel Postgres).

## Features

- Modern, responsive UI with pixel art design elements
- Light/dark mode theming using CSS variables and next-themes
- Terminal-style interactions and AI chat assistance
- Interactive guest book system with comment moderation
- Uber delivery service portfolio with customer review system
- Animated page transitions and UI elements using Framer Motion
- Interactive code activity visualizations powered by WakaTime API
- Headless CMS for content management with PayloadCMS
- Advanced security features with Cloudflare Turnstile integration
- TypeScript for type safety
- Optimized image handling with Next.js Image component
- Comprehensive API routes with proper error handling and validation

## Project Structure

### Main Directories

- `src/app/(frontend)`: Frontend components, pages, API routes, styles, and utilities
  - `components/`: UI components organized by feature
    - `guest-book/`: Guest book system components (forms, sections)
    - `uber/`: Uber delivery service portfolio components
    - `welcome/`: Welcome page components including AI chat bot
    - `common/terminal/`: Terminal interface for AI chat
  - `pages/`: Page components for different routes
    - `welcome/guest-book/`: Digital guest book page
    - `services/uber/`: Uber delivery service showcase
  - `api/`: API routes for the frontend
    - `ai-chat/`: AI chat bot API with security features
    - `query-functions/`: Data fetching functions for guest book and Uber comments
  - `styles/`: CSS modules and styling utilities
  - `hooks/`, `contexts/`, `providers/`: React patterns for state management
- `src/app/(payload)`: PayloadCMS admin panel and API routes
- `src/collections`: PayloadCMS collection definitions (data models)
  - `GuestBookComments.ts`: Guest book comment collection
  - `UberComments.ts`: Uber delivery service review collection
- `public`: Static assets (fonts, images, pixel art)

### Key Configuration Files

- `next.config.mjs`: Next.js configuration
- `postcss.config.mjs`: PostCSS configuration for Tailwind CSS v4
- `tsconfig.json`: TypeScript configuration
- `package.json`: Project dependencies and scripts
- `payload.config.ts`: PayloadCMS configuration
- `docker-compose.yml`: Docker configuration for local development

## Data Collections

The project uses PayloadCMS with these main collections:

- **Users**: Authentication and admin access with role-based permissions
- **Media**: Manages uploaded media files with metadata
- **Posts**: Blog posts with rich text content, categories, tags, and automatic read time calculation
- **Guest Book Comments**: User-submitted comments with moderation system and Turnstile verification
- **Uber Comments**: Customer reviews for delivery service with rating system and approval workflow

## New Interactive Features

### Guest Book System
- Digital guest book where visitors can leave messages
- Comment moderation system with admin approval
- Cloudflare Turnstile integration for spam prevention
- Real-time display of approved comments
- Responsive design with pixel art aesthetics

### Uber Delivery Service Portfolio
- Professional delivery driver showcase
- Customer review and rating system (0.5 to 5 stars)
- Service statistics and professional gear display
- Comment submission with delivery type categorization
- Moderated review system for quality control

### AI Terminal Chat Bot (Nelson)
- Interactive AI assistant with terminal interface
- Command system with built-in help and utilities
- Natural language processing for portfolio inquiries
- Advanced security with Turnstile verification per message
- Markdown support for formatted responses
- XSS protection and input sanitization

## Quick Start

### Prerequisites

- Node.js 20.2+ or 22.14+
- pnpm 9 or 10
- PostgreSQL database (or Docker for local setup)

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
POSTGRES_URL=your_database_url

# PayloadCMS
PAYLOAD_SECRET=your_payload_secret

# Security
TURNSTILE_SECRET_KEY=your_turnstile_secret
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key

# AI Chat (Optional)
AI_CHAT_JWT_SECRET=your_jwt_secret
N8N_WEBHOOK_URL=your_n8n_webhook_url

# Email (Optional)
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### Local Development

1. Clone the repository

   ```bash
   git clone https://github.com/lst97/lst97-dev.git
   cd lst97-dev
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Set up environment variables

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your database connection details and other required variables.

4. Start the development server

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Using Docker (Optional)

For local development with Docker:

1. Make sure Docker and Docker Compose are installed
2. Update the `POSTGRES_URL` in your `.env` file
3. Run the containers

   ```bash
   docker-compose up -d
   ```

## Available Scripts

- `pnpm dev`: Starts the development server with Turbopack
- `pnpm devsafe`: Cleans the Next.js cache and starts the development server
- `pnpm build`: Builds the application for production
- `pnpm start`: Starts the production server
- `pnpm lint`: Runs the linter
- `pnpm generate:types`: Generates TypeScript types for PayloadCMS collections

## API Architecture

The project features a comprehensive API architecture with:

### Frontend API Routes (`/api`)
- `/ai-chat`: AI chat bot with JWT authentication and Turnstile verification
- `/guest-book-comments`: Guest book comment management
- `/uber-comments`: Uber delivery service review management
- `/client-info`: Client information gathering for security
- `/wakatime/*`: WakaTime integration for coding statistics

### Security Features
- Cloudflare Turnstile integration for spam prevention
- JWT authentication for AI chat services
- Input sanitization and XSS protection
- Rate limiting and abuse prevention
- IP address and user agent logging for moderation

### Data Validation
- Zod schemas for all API inputs
- Comprehensive error handling
- Type-safe API responses
- Request/response standardization

## Styling System

The project uses a custom styling system with:

- Tailwind CSS v4 for utility classes
- CSS modules for component-specific styles
- Theme variables for light/dark mode in globals.css
- Custom utility classes for special effects
- Pixel art aesthetic with retro gaming inspiration

## State Management

State is managed through a combination of:

- React hooks for local component state
- Context API for global state
- Zustand for more complex state management
- TanStack React Query for server state and caching

## Technologies

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4, Framer Motion
- **Backend**: Next.js API Routes, PayloadCMS
- **Database**: PostgreSQL (via Vercel Postgres)
- **AI Integration**: Custom AI chat with n8n webhook integration
- **Security**: Cloudflare Turnstile, JWT authentication, Zod validation
- **State Management**: TanStack React Query, Zustand, React Context
- **Deployment**: Vercel (recommended)
- **Package Manager**: pnpm

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT
