# Custom API Endpoints

## Overview

This directory contains custom API endpoints that extend PayloadCMS's default functionality. These endpoints are designed to work alongside PayloadCMS's built-in API routes without causing conflicts.

## Why Custom Endpoints?

PayloadCMS automatically provides RESTful API endpoints for all collections:

- `GET /api/{collection}` - List/find items in a collection
- `GET /api/{collection}/{id}` - Get a specific item by ID
- `GET /api/{collection}/count` - Count items in a collection
- `POST /api/{collection}` - Create a new item
- `PATCH /api/{collection}/{id}` - Update an item
- `DELETE /api/{collection}/{id}` - Delete an item

Our custom endpoints in `/api/custom/` are created for the following reasons:

1. **Data Transformation** - Custom mapping of PayloadCMS data to frontend-specific models
2. **Business Logic** - Adding application-specific logic (e.g., view counting)
3. **Additional Features** - Providing functionality not available in the default endpoints
4. **Avoiding Conflicts** - Prevents route conflicts with PayloadCMS's automatic API routes

## API Structure

The project organizes API endpoints in the following way:

1. **PayloadCMS Default API** - `src/app/(payload)/api/[...slug]`
   - Automatically generated REST endpoints for all collections
   - GraphQL API at `/api/graphql`

2. **Custom API Endpoints** - `src/app/(payload)/api/custom/`
   - Extended functionality and data transformations
   - Business logic specific to the frontend requirements

3. **Frontend API Services** - `src/app/(frontend)/api/`
   - External API integrations (GitHub, WakaTime, Weather)
   - Frontend-specific data services

## Custom Endpoints Available

- `GET /api/custom/posts` - Returns a transformed list of published posts with frontend-friendly data structure
- `GET /api/custom/posts/{id}` - Returns a transformed single post with additional logic (view count tracking)

## When to Use Custom vs Default

| Use Custom API Endpoints When: | Use Default PayloadCMS Endpoints When: |
|-------------------------------|------------------------------------|
| You need transformed data for the frontend | You need raw data as stored in the database |
| You need to execute additional business logic | You need simple CRUD operations |
| You're building frontend-specific features | You're building admin functionality |
| You need specialized filtering or sorting | You need standard filtering supported by PayloadCMS query params |
| You want to add caching or performance optimizations | You need direct database access |

## Integration with Frontend

When integrating with the frontend:

1. Custom endpoints should return data in a format that matches the frontend models
2. Use consistent error handling and response formatting
3. Consider implementing caching for frequently accessed data
4. Document the response structure for other developers

## How to Add New Custom Endpoints

1. Create a new directory under `/api/custom/`
2. Create a `route.ts` file with appropriate HTTP methods
3. Use the PayloadCMS SDK to interact with your collections
4. Transform data as needed for your frontend

Example:

```typescript
// /api/custom/example/route.ts
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    // Your custom logic here
    return NextResponse.json({ data: result })
  } catch (error) {
    return NextResponse.json({ error: 'Error message' }, { status: 500 })
  }
} 
