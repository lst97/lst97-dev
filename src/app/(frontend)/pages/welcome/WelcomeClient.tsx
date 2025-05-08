'use client'

import React, { Suspense } from 'react'
import Image from 'next/image'
import { LoadingSpinner } from '@/frontend/components/common/LoadingSpinner'
import dynamic from 'next/dynamic'
import {
  AIChatBot,
  Introduction,
  SomethingIMade,
  MyNotes,
  Accessories,
  FromTheLab,
} from '@/frontend/components/welcome'

// Dynamically import Dashboard component with SSR disabled
const DynamicDashboard = dynamic(
  () => import('@/frontend/components/main/Dashboard').then((mod) => mod.Dashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-screen">
        <LoadingSpinner />
        <div className="mt-4 font-['Press_Start_2P'] text-sm">Loading dashboard...</div>
      </div>
    ),
  },
)

// Loading component for inner content
function ContentLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <LoadingSpinner />
      <div className="mt-4 font-['Press_Start_2P'] text-sm">Loading welcome page...</div>
    </div>
  )
}

// Content component
function WelcomeContent() {
  return (
    <div className="border-4 border-border bg-card lg:p-8 sm:p-2 mt-16 overflow-x-hidden no-scrollbar">
      <AIChatBot />
      <div className="flex flex-col gap-32">
        <Introduction />
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center text-gray-500 dark:text-gray-400 text-center text-xl font-['Press_Start_2P'] tracking-widest leading-loose text-shadow-lg border-2 border-gray-500 dark:border-gray-400 p-4 rounded-lg bg-amber-100 shadow-md mx-4 md:mx-8 lg:mx-16">
          <Image src="/maintain.gif" alt="Maintenance" width={150} height={150} priority />
          <div className="text-sm tracking-widest leading-loose text-shadow-lg press-start-2p-regular">
            Website is currently under construction, and the following components serve as temporary
            placeholders. As the site evolves, I will be adding more content and updates.
          </div>
        </div>
        <SomethingIMade />
        <MyNotes />
        <FromTheLab />
        <Accessories />
      </div>
    </div>
  )
}

// Main client component
export default function WelcomeClient() {
  return (
    <DynamicDashboard>
      <Suspense fallback={<ContentLoading />}>
        <WelcomeContent />
      </Suspense>
    </DynamicDashboard>
  )
}
