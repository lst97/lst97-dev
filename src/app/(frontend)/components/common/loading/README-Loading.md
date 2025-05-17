# Loading Components

This directory contains components for handling loading states across both server and client components in Next.js.

## Components

- `Loading.tsx` - Client-side animated loading components using Framer Motion
- `StaticLoading.tsx` - Server-compatible static loading components
- `LoadingProvider.tsx` - Unified API for loading components

## Usage

### In Server Components

For server components, use the `ServerLoadingSpinner` or `ServerPageLoading` from the LoadingProvider:

```tsx
import { ServerPageLoading } from '@/frontend/components/common/LoadingProvider'

export default function MyServerComponent() {
  return (
    <Suspense fallback={<ServerPageLoading message="Loading data..." />}>
      <MyContent />
    </Suspense>
  )
}
```

### In Client Components

For client components, use dynamic imports to avoid the "export * in client boundary" error:

```tsx
'use client'

import React, { useEffect, useState } from 'react'

const MyClientComponent: React.FC = () => {
  const [Loading, setLoading] = useState<React.ComponentType<{ message?: string }> | null>(null)
  
  useEffect(() => {
    // Dynamically import the client loading component
    const { getClientLoadingComponents } = require('./common/LoadingProvider')
    const { ClientPageLoading } = getClientLoadingComponents()
    setLoading(() => ClientPageLoading)
  }, [])
  
  if (!Loading) {
    // Fallback while loading the component
    return <div>Loading...</div>
  }
  
  return <Loading message="Loading content..." />
}
```

Alternatively, for simpler cases, you can create a client-only component that imports the loading components directly:

```tsx
'use client'

import { PageLoading } from '@/frontend/components/common/Loading'

export default function MyClientLoadingComponent({ message }: { message?: string }) {
  return <PageLoading message={message} />
}
```

Then use this component in your application:

```tsx
import MyClientLoadingComponent from './MyClientLoadingComponent'

// In a client component
<Suspense fallback={<MyClientLoadingComponent message="Loading..." />}>
  <Content />
</Suspense>
```

## Why This Pattern?

Next.js 15 with React Server Components has a limitation where "export *" statements cannot be used in client boundaries. Since Framer Motion uses this pattern, we need to separate our loading components into server-compatible and client-only versions. 