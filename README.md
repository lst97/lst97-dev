# lst97-dev - Personal Website and Portfolio

This project is a personal website and portfolio built with **Next.js 15**, **React 19**, **Tailwind CSS v4**, **Framer Motion** for animations, and **PayloadCMS** as a headless CMS with PostgreSQL database (via Vercel Postgres).

## Features

- Modern, responsive UI with pixel art design elements
- Light/dark mode theming using CSS variables and next-themes
- Terminal-style interactions
- Animated page transitions and UI elements using Framer Motion
- Interactive code activity visualizations powered by WakaTime API
- Headless CMS for content management with PayloadCMS
- TypeScript for type safety
- Optimized image handling with Next.js Image component
- API routes for contact forms, GitHub integration, and more

## Project Structure

### Main Directories

- `src/app/(frontend)`: Frontend components, pages, API routes, styles, and utilities
  - `components/`: UI components organized by feature
  - `pages/`: Page components for different routes
  - `api/`: API routes for the frontend
  - `styles/`: CSS modules and styling utilities
  - `hooks/`, `contexts/`, `providers/`: React patterns for state management
- `src/app/(payload)`: PayloadCMS admin panel and API routes
- `src/collections`: PayloadCMS collection definitions (data models)
- `public`: Static assets (fonts, images, etc.)

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

## Quick Start

### Prerequisites

- Node.js 20.2+ or 22.14+
- pnpm 9 or 10
- PostgreSQL database (or Docker for local setup)

### Local Development

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/lst97-dev.git
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

## Styling System

The project uses a custom styling system with:

- Tailwind CSS v4 for utility classes
- CSS modules for component-specific styles
- Theme variables for light/dark mode in globals.css
- Custom utility classes for special effects

## State Management

State is managed through a combination of:

- React hooks for local component state
- Context API for global state
- Zustand for more complex state management

## Technologies

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4, Framer Motion
- **Backend**: Next.js API Routes, PayloadCMS
- **Database**: PostgreSQL (via Vercel Postgres)
- **Deployment**: Vercel (recommended)
- **Package Manager**: pnpm

## License

MIT
