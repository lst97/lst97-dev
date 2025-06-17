// Type definitions for release note data
export interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
}

export interface ReleaseNoteData {
  title: string
  overview: string
  projectDescription: string
  features: string[]
  knownIssues: string[]
  futureDevelopment: string[]
  changelog?: ChangelogEntry[]
  dependencies: string[]
  devDependencies: string[]
  feedback: string
}

export const releaseNoteData: ReleaseNoteData = {
  title: 'lst97.dev - Alpha Release Notes v1.0.0.alpha.4',
  overview:
    'This document outlines the features, updates, and known issues for the alpha release v1.0.0.alpha.4 of the lst97.dev project. This version represents a major milestone with the introduction of interactive user engagement features, AI-powered chat assistance, and comprehensive service showcases. The release includes a guest book system, Uber delivery service portfolio with customer review system, and an AI terminal chat bot with advanced security features. As an alpha release, this version is intended for early testing and feedback.',
  projectDescription:
    'lst97.dev is a modern personal portfolio website and comprehensive tool collection built with Next.js 15, React 19, and TypeScript. It features a unique retro gaming theme inspired by pixel art and classic games, enhanced with PayloadCMS for content management, interactive user engagement systems, and AI-powered assistance. The project demonstrates advanced web development skills including real-time user interactions, AI integration, multi-threaded processing, comprehensive security measures, and privacy-focused client-side computing.',
  features: [
    'Modern Tech Stack: Built with Next.js 15, React 19, TypeScript 5.8, and Tailwind CSS v4 for cutting-edge performance',
    'PayloadCMS Integration: Headless CMS with GraphQL API, admin panel at /admin, and PostgreSQL database via Vercel',
    'Interactive Guest Book System: Digital guest book with comment submission, moderation system, and public display',
    'Uber Delivery Service Portfolio: Professional delivery driver showcase with customer review and rating system',
    'AI-Powered Terminal Chat Bot: Nelson AI assistant with terminal interface, command system, and natural language processing',
    'Advanced Security Features: Cloudflare Turnstile integration for spam prevention, JWT authentication, and XSS protection',
    'Comprehensive Tools Suite: Browser-based tools including AI-powered file type detection, image converter, and background remover',
    'AI-Powered Features: Google Magika for file detection, BRIA AI RMBG-1.4 for background removal, all running client-side',
    'Multi-Threaded Processing: Advanced Web Workers implementation for image processing with up to 8 parallel workers',
    'Enhanced Project Showcase: Interactive project dialogs with physics-based technology displays using Matter.js',
    'WakaTime Integration: Real-time coding activity statistics and detailed analytics dashboard',
    'Content Management System: PayloadCMS with custom collections for guest book comments, Uber reviews, and blog posts',
    'Responsive Design: Fully optimized for mobile, tablet, and desktop with pixel-perfect retro aesthetics',
    'Privacy-First Tools: All file processing happens locally in the browser with no server uploads',
    'Performance Optimizations: Vercel Analytics, Speed Insights, and advanced caching strategies',
    'Interactive Resume: Dynamic CV with timeline, skills visualization, and downloadable PDF',
    'Advanced API Architecture: RESTful APIs with proper error handling, rate limiting, and security measures',
    'Real-time User Interactions: Guest book comments, service reviews, and AI chat with instant feedback',
  ],
  knownIssues: [
    'AI Model Loading: Initial load of AI-powered tools may take time as models need to be downloaded (~3MB)',
    'Browser Performance: Large file processing may temporarily slow down browsers due to intensive client-side computation',
    'Mobile Optimization: Some complex interactive elements may have reduced functionality on older mobile devices',
    'Tool Compatibility: Advanced features require modern browsers with Web Workers and WebGL support',
    'AI Chat Limitations: Terminal chat requires security verification for each message and may have response delays',
    'Guest Book Moderation: Comments require manual approval before public display, which may cause delays',
    'Uber Service Reviews: Customer reviews are moderated and may not appear immediately after submission',
  ],
  futureDevelopment: [
    'Enhanced AI Chat: Improved conversation memory, faster response times, and additional command features',
    'Real-time Notifications: Live updates for new comments, reviews, and system notifications',
    'Advanced Analytics: Detailed visitor analytics, engagement metrics, and performance insights',
    'Additional Tools: HEIC converter, PDF tools, code formatters, and developer utilities',
    'Enhanced AI Features: More AI models for different file types and processing capabilities',
    'Batch Processing: Improved batch operations for multiple files with progress tracking',
    'Performance Optimization: Further optimization for mobile devices and slower connections',
    'Content Management: Expanded blog and resource sections with PayloadCMS',
    'API Integrations: Additional third-party service integrations for enhanced functionality',
    'User Authentication: Optional user accounts for personalized experiences and saved preferences',
    'Multi-language Support: Internationalization for global accessibility',
  ],
  changelog: [
    {
      version: 'v1.0.0.alpha.4',
      date: 'June 2025',
      changes: [
        'Added interactive guest book system with comment submission and moderation',
        'Implemented Uber delivery service portfolio with customer review and rating system',
        'Introduced Nelson AI terminal chat bot with command system and natural language processing',
        'Enhanced security with Cloudflare Turnstile integration and JWT authentication',
        'Added comprehensive API architecture with proper error handling and validation',
        'Implemented PayloadCMS collections for guest book comments and Uber reviews',
        'Enhanced user experience with real-time interactions and feedback systems',
        'Added advanced input sanitization and XSS protection for all user inputs',
        'Improved responsive design and mobile optimization for interactive features',
        'Added comprehensive documentation for new API endpoints and features',
      ],
    },
    {
      version: 'v1.0.0.alpha.3',
      date: 'May 2025',
      changes: [
        'Added react-youtube dependency for enhanced video presentation',
        'Enhanced LandingClient with improved animations and interactions',
        'Improved background removal tool with multi-threaded processing',
        'Updated component imports and project structure optimization',
      ],
    },
    {
      version: 'v1.0.0.alpha.2',
      date: 'May 2025',
      changes: [
        'Added comprehensive file type detection tool using Google Magika AI',
        'Implemented image converter with support for JPG, PNG, WebP, and GIF',
        'Enhanced dependency management and project structure',
        'Improved component organization and reusability',
      ],
    },
    {
      version: 'v1.0.0.alpha.1',
      date: 'May 2025',
      changes: [
        'Complete migration to Tailwind CSS v4 and modern architecture',
        'Integrated PayloadCMS for content management',
        'Enhanced responsive design and mobile optimization',
        'Added Vercel Analytics and Speed Insights',
        'Implemented Cloudflare Turnstile for security',
        'Enhanced email system with Nodemailer integration',
      ],
    },
  ],
  dependencies: [
    '@heroicons/react ^2.2.0',
    '@huggingface/transformers ^3.5.2',
    '@payloadcms/db-vercel-postgres ^3.40.0',
    '@payloadcms/next ^3.40.0',
    '@payloadcms/richtext-lexical ^3.40.0',
    '@radix-ui/react-* (multiple components)',
    '@tanstack/react-query ^5.79.0',
    '@vercel/analytics ^1.5.0',
    '@vercel/speed-insights ^1.2.0',
    'framer-motion ^12.15.0',
    'jsonwebtoken ^9.0.2',
    'next ^15.3.3',
    'react ^19.1.0',
    'react-markdown ^9.0.1',
    'react-youtube ^10.1.0',
    'magika ^0.3.2',
    'matter-js ^0.20.0',
    'sharp ^0.34.2',
    'tailwindcss ^4.1.8',
    'typescript ^5.8.3',
    'zustand ^5.0.5',
    'zod ^3.23.8',
  ],
  devDependencies: [
    '@tailwindcss/postcss ^4.1.8',
    '@types/jsonwebtoken ^9.0.7',
    '@types/node ^22.15.29',
    '@types/react ^19.1.6',
    '@types/react-dom ^19.1.5',
    'dependency-cruiser ^16.10.2',
    'eslint-plugin-react ^7.37.5',
    'typescript ^5.8.3',
  ],
  feedback:
    'Feedback is highly encouraged and appreciated. You can now provide feedback through multiple channels: use the interactive guest book to leave public messages, submit reviews if you\'ve used the Uber delivery service, chat with Nelson AI assistant for instant help, or contact through the project\'s <a class="text-primary underline" href="https://github.com/lst97/lst97-dev" target="_blank" rel="noopener noreferrer">GitHub repository</a> or the website contact form.',
}
