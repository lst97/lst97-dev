'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  FileUploadSection,
  FileProcessingList,
  ResultsSection,
  ProcessingNotice,
} from './components/interface'
import { useFileDetection } from './hooks/useFileDetection'
import { FaInfoCircle, FaRobot, FaCode, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'

export const FileTypeDetector: React.FC = () => {
  const [dragActive, setDragActive] = useState<boolean>(false)
  const [globalError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Use the file detection hook
  const { processingFiles, handleFiles, detectionResults, isProcessing, clearResults } =
    useFileDetection()

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  // Handle drop event
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(Array.from(e.dataTransfer.files))
      }
    },
    [handleFiles],
  )

  // Determine if processing notice should be shown
  const isProcessingInProgress = processingFiles.some(
    (file) => file.status !== 'completed' && file.status !== 'error',
  )

  const activeProcessingCount = processingFiles.filter(
    (file) => file.status !== 'completed' && file.status !== 'error',
  ).length

  return (
    <div className="bg-card-background w-full max-w-6xl mx-auto p-8 border-4 border-border rounded-none shadow-[8px_8px_0px_#000]">
      <h2 className="text-2xl font-bold mb-8 text-center font-['Press_Start_2P'] ">
        File Type Detector
      </h2>

      {/* Dual-engine approach explanation */}
      <div className="mb-8 border-4 border-border p-6 rounded-none bg-accent/5">
        <h3 className="text-lg font-['Press_Start_2P'] mb-4 flex items-center">
          <FaInfoCircle className="mr-2" /> Dual-Engine Detection
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="border-2 border-border p-4 rounded-none bg-card-background">
            <h4 className="font-['Press_Start_2P'] text-sm mb-2 flex items-center">
              <FaRobot className="mr-2 text-success" /> AI Engine (Magika)
            </h4>
            <p className="font-['Press_Start_2P'] text-xs">
              Uses Google&apos;s deep learning model to analyze file content patterns and identify
              over 200 file types.
            </p>
          </div>
          <div className="border-2 border-border p-4 rounded-none bg-card-background">
            <h4 className="font-['Press_Start_2P'] text-sm mb-2 flex items-center">
              <FaCode className="mr-2 text-warning" /> Algorithm Engine (file-type)
            </h4>
            <p className="font-['Press_Start_2P'] text-xs">
              Uses traditional signature-based detection to identify common file formats by their
              headers.
            </p>
          </div>
        </div>
        <div className="font-['Press_Start_2P'] text-xs">
          <p className="mb-2">
            <strong>How it works:</strong> Both engines analyze each file and their results are
            compared:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              When both engines agree, we have high confidence in the result (
              <FaCheckCircle className="inline text-success" />)
            </li>
            <li>
              When engines disagree, we check if Magika supports the format detected by file-type
            </li>
            <li>If Magika doesn&apos;t support it, we trust the file-type result</li>
            <li>
              If the file might be obfuscated, we warn you (
              <FaExclamationTriangle className="inline text-warning" />)
            </li>
          </ul>
        </div>
      </div>

      {/* Upload section */}
      <FileUploadSection
        onFileUpload={handleFiles}
        dragActive={dragActive}
        handleDrag={handleDrag}
        handleDrop={handleDrop}
        fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
      />

      {/* Processing notice for potential UI lag */}
      <ProcessingNotice isVisible={isProcessingInProgress} fileCount={activeProcessingCount} />

      {/* Error message */}
      {globalError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-100 border-2 border-red-400 text-red-700 rounded-none"
        >
          {globalError}
        </motion.div>
      )}

      {/* Processing Files List */}
      <FileProcessingList files={processingFiles} />

      {/* Results */}
      {detectionResults.length > 0 && (
        <ResultsSection
          results={detectionResults}
          clearResults={clearResults}
          isProcessing={isProcessing}
        />
      )}
    </div>
  )
}
