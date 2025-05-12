'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { LoadingSpinner, PageLoading } from '@/app/(frontend)/components/common/loading/Loading'
import { routes } from '@/app/(frontend)/constants/routes'
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { FileTypeDetector } from '@/app/(frontend)/components/tools/file-type'

// Dynamically import the Dashboard component with SSR disabled
const DynamicDashboard = dynamic(
  () => import('@/frontend/components/main/Dashboard').then((mod) => mod.Dashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    ),
  },
)

const TypeDetectionPage = () => {
  return (
    <DynamicDashboard>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Page Header */}
        <div className="mb-8">
          <div className="breadcrumbs font-['Press_Start_2P'] text-xs mb-4">
            <Link
              href={`${routes.tools}/file`}
              className="bg-card font-['Press_Start_2P'] text-sm border-2 border-border px-3 py-2 shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              aria-label="Back to file tools"
            >
              ← Back to File Tools
            </Link>
          </div>
          <h1 className="text-3xl font-['Press_Start_2P'] mb-4">AI-Powered File Type Detection</h1>
        </div>

        {/* Info Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card-background border-4 border-border p-4 rounded-none shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-all">
            <div className="flex items-start">
              <div className="mr-3 text-blue-500">
                <FaInfoCircle size={20} style={{ filter: 'drop-shadow(2px 2px 0 #000)' }} />
              </div>
              <div>
                <h3 className="font-['Press_Start_2P'] text-sm mb-2">Private Processing</h3>
                <p className=" font-['Press_Start_2P'] text-xs opacity-80">
                  All processing happens locally in your browser. Your files are never uploaded to a
                  server.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-background border-4 border-border p-4 rounded-none shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-all">
            <div className="flex items-start">
              <div className="mr-3 text-green-500">
                <FaCheckCircle size={20} style={{ filter: 'drop-shadow(2px 2px 0 #000)' }} />
              </div>
              <div>
                <h3 className="font-['Press_Start_2P'] text-sm mb-2">AI-Powered</h3>
                <p className=" font-['Press_Start_2P'] text-xs opacity-80">
                  Uses Google&apos;s Magika AI technology to detect over 200 file types with high
                  accuracy.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-background border-4 border-border p-4 rounded-none shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-all">
            <div className="flex items-start">
              <div className="mr-3 text-yellow-500">
                <FaExclamationTriangle
                  size={20}
                  style={{ filter: 'drop-shadow(2px 2px 0 #000)' }}
                />
              </div>
              <div>
                <h3 className="font-['Press_Start_2P'] text-sm mb-2">First Load</h3>
                <p className="font-['Press_Start_2P'] text-xs opacity-80">
                  Initial load may take a moment as the AI model needs to be downloaded.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Tool Section */}
        <Suspense fallback={<PageLoading />}>
          <FileTypeDetector />
        </Suspense>

        {/* Additional Information */}
        <div className="mt-12 bg-card-background border-4 border-border p-6 rounded-none shadow-[4px_4px_0px_#000]">
          <h2 className="text-xl font-['Press_Start_2P'] mb-4">About This Tool</h2>
          <p className="mb-4 font-['Press_Start_2P'] text-sm">
            This tool uses Google&apos;s Magika, an AI-powered file type detector that can identify
            over 200 different file types with high accuracy. Unlike traditional file type detection
            methods that rely on file extensions or signatures, Magika uses deep learning to analyze
            the actual content of files.
          </p>
          <h3 className="text-lg font-['Press_Start_2P'] mt-6 mb-2">How It Works</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4 font-['Press_Start_2P'] text-sm">
            <li>
              Upload any file (or multiple files) using the drag-and-drop area or file browser
            </li>
            <li>The AI model analyzes each file locally in your browser</li>
            <li>Results show the detected file type, MIME type, and other details</li>
            <li>All processing happens on your device - files are never sent to a server</li>
          </ol>
          <div className="mt-6 p-4 bg-accent-color/10 border-l-4 border-accent-color rounded-none">
            <p className="font-['Press_Start_2P'] text-xs">
              <strong>Note:</strong> The first time you use this tool, it may take a moment to load
              as it needs to download the AI model (approximately 3MB). Subsequent uses will be much
              faster.
            </p>
          </div>
        </div>
      </motion.div>
    </DynamicDashboard>
  )
}
export default TypeDetectionPage
