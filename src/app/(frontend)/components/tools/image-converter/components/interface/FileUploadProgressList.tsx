'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ProcessingFile } from '@/frontend/components/tools/image-converter/types'

// Status icon mapping
const StatusIcon: React.FC<{ status: ProcessingFile['status'] }> = ({ status }) => {
  switch (status) {
    case 'queued':
      return <div className="h-4 w-4 rounded-none border-2 border-border bg-gray-300"></div>
    case 'reading':
    case 'generating_preview':
    case 'extracting_metadata':
      return (
        <motion.div
          className="h-4 w-4 rounded-none bg-blue-500 border-2 border-border"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )
    case 'completed':
      return <div className="h-4 w-4 rounded-none bg-green-500 border-2 border-border"></div>
    case 'error':
      return <div className="h-4 w-4 rounded-none bg-red-500 border-2 border-border"></div>
    default:
      return null
  }
}

// Status text mapping
const getStatusText = (status: ProcessingFile['status']): string => {
  switch (status) {
    case 'queued':
      return 'Waiting to process'
    case 'reading':
      return 'Reading file'
    case 'generating_preview':
      return 'Generating preview'
    case 'extracting_metadata':
      return 'Extracting metadata'
    case 'completed':
      return 'Ready'
    case 'error':
      return 'Error'
    default:
      return 'Unknown'
  }
}

type FileItemProps = {
  file: ProcessingFile
}

const FileItem: React.FC<FileItemProps> = ({ file }) => {
  const { name, status, progressPercent, error } = file

  // Format file size
  const formatSize = (size: number): string => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-2 px-3 bg-card-background border-2 border-border rounded-none mb-2 last:mb-0 shadow-[2px_2px_0px_#000]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <StatusIcon status={status} />
          <div className="ml-3">
            <div className="font-['Press_Start_2P'] text-xs truncate max-w-[200px]">{name}</div>
            <div className="text-xs opacity-70 font-['Press_Start_2P']">
              {formatSize(file.size)}
            </div>
          </div>
        </div>
        <div className="text-xs font-['Press_Start_2P']">{getStatusText(status)}</div>
      </div>

      {/* Progress bar */}
      <div className="mt-2 bg-gray-200 dark:bg-gray-700 h-3 overflow-hidden border-2 border-border">
        <motion.div
          className={`h-full ${status === 'error' ? 'bg-red-500' : 'bg-accent-color'}`}
          initial={{ width: 0 }}
          animate={{
            width:
              status === 'completed'
                ? '100%'
                : status === 'error'
                  ? '100%'
                  : progressPercent
                    ? `${progressPercent}%`
                    : status === 'queued'
                      ? '10%'
                      : status === 'reading'
                        ? '30%'
                        : status === 'generating_preview'
                          ? '60%'
                          : status === 'extracting_metadata'
                            ? '90%'
                            : '0%',
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Error message */}
      {error && <div className="mt-2 text-xs text-red-500 font-['Press_Start_2P']">{error}</div>}
    </motion.div>
  )
}

type FileUploadProgressListProps = {
  files: ProcessingFile[]
}

const FileUploadProgressList: React.FC<FileUploadProgressListProps> = ({ files }) => {
  if (files.length === 0) return null

  // Filter files that are not yet completed
  const processingFiles = files.filter((file) => file.status !== 'completed')

  // If no files are processing, don't display anything
  if (processingFiles.length === 0) return null

  return (
    <div className="space-y-2 mb-6">
      <h3 className="text-sm font-['Press_Start_2P'] mb-2">
        Processing {processingFiles.length} files...
      </h3>
      <div className="max-h-[200px] overflow-y-auto pr-2">
        {processingFiles.map((file) => (
          <FileItem key={file.id} file={file} />
        ))}
      </div>
    </div>
  )
}

export default FileUploadProgressList
