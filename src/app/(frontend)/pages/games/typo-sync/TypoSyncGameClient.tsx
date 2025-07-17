'use client'

import React, { Suspense } from 'react'
import TypoSyncClient from '@/frontend/components/games/typo-sync/components/TypoSyncClient'
import { PageLoading } from '@/app/(frontend)/components/common/loading'
import dynamic from 'next/dynamic'

const DynamicDashboard = dynamic(
  () => import('@/frontend/components/main/Dashboard').then((mod) => mod.Dashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="mt-4 font-['Press_Start_2P'] text-sm">Loading dashboard...</div>
      </div>
    ),
  },
)

export default function TypoSyncGameClient() {
  return (
    <DynamicDashboard>
      <Suspense fallback={<PageLoading message="Loading TypoSync Enhanced..." />}>
        <TypoSyncClient />
      </Suspense>
    </DynamicDashboard>
  )
}
