'use client'

import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { FaFileUpload } from 'react-icons/fa'

type UploadSectionProps = {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  modelLoaded: boolean
  modelLoading: boolean
  isBatchActive: boolean
  hasPendingOrQueuedJobs: boolean
  onStartBatch: () => void
  remainingJobCount: number
  modelLoadingProgress?: number
  modelLoadingStatus?: string
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onFileUpload,
  modelLoaded,
  modelLoading,
  isBatchActive,
  hasPendingOrQueuedJobs,
  onStartBatch,
  remainingJobCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div
        onClick={triggerFileInput}
        className={`p-8 border-4 border-dashed rounded-none cursor-pointer text-center transition-all 
          ${modelLoading || isBatchActive ? 'opacity-50 cursor-not-allowed' : 'border-border hover:border-accent-color hover:bg-accent-color/10'}
          ${modelLoading || isBatchActive ? 'pointer-events-none' : ''}
        `}
      >
        <FaFileUpload className="mx-auto text-4xl mb-4 text-accent-color" />
        <p className="mb-2 font-bold text-lg font-['Press_Start_2P']">
          {modelLoading ? 'Loading AI model...' : 'Drop your images here or click to upload'}
        </p>
        <p className="text-sm opacity-70 font-['Press_Start_2P']">
          Supports JPG, PNG • Multiple files allowed
        </p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileUpload}
          accept="image/png, image/jpeg"
          multiple
          className="hidden"
          disabled={modelLoading || isBatchActive}
        />
      </div>

      {/* Start Processing Button */}
      {(hasPendingOrQueuedJobs || isBatchActive) && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={onStartBatch}
            disabled={!modelLoaded || isBatchActive || modelLoading}
            className="p-3 rounded-none font-['Press_Start_2P'] text-sm flex items-center justify-center gap-2 transition-all
              bg-accent-color hover:bg-accent-color/80
              disabled:opacity-50 disabled:cursor-not-allowed
              border-4 border-border shadow-[4px_4px_0px_#000]
              hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]
              active:shadow-none active:translate-x-[4px] active:translate-y-[4px] bg-border text-card
              min-w-[250px]"
          >
            {isBatchActive
              ? `Processing Batch... (${remainingJobCount} remaining)`
              : 'Start Processing Batch'}
          </button>
        </div>
      )}
    </motion.div>
  )
}
