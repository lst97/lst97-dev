# API Backend Proxy

This directory contains API routes that serve as proxies for external services and internal functionality.

## Structure

```
api/
├── contact/     - Email contact form API
├── github/      - GitHub API integration
├── wakatime/    - WakaTime API integration for code statistics
│   ├── code-activity/
│   ├── editors/
│   ├── languages/
│   └── operating-systems/
└── weather/     - Weather data API integration
```

## API Routes

Each subdirectory contains a Next.js API route handler that:

1. Authenticates requests when necessary
2. Handles request validation
3. Proxies requests to external APIs
4. Formats and returns responses

## Usage

These API endpoints can be consumed by the frontend using fetch:

```typescript
// Example usage
const response = await fetch('/api/github/repos');
const data = await response.json();
```

## Authentication

Some API routes require authentication tokens which are stored as environment variables.
See `.env.example` for required environment variables.

## Error Handling

All API routes follow a consistent error handling pattern, returning appropriate
HTTP status codes and error messages in a standard format. 