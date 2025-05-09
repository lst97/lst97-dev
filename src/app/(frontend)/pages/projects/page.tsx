'use client'

import { Suspense } from 'react'
import ProjectsClient from './ProjectsClient'
import { PageLoading } from '@/app/(frontend)/components/common/loading/Loading'
import { Footer } from '@/frontend/components/footer'

export default function ProjectsPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading projects..." />}>
      <ProjectsClient />
      <Footer />
    </Suspense>
  )
}
