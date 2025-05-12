'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FaTrash,
  FaFileImage,
  FaFileAudio,
  FaFileVideo,
  FaFileCode,
  FaFilePdf,
  FaFileArchive,
  FaFileAlt,
  FaQuestion,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa'
import { DetectionResult } from '../../types'
import { PixelScrollArea } from '@/app/(frontend)/components/ui/ScrollArea'

interface ResultsSectionProps {
  results: DetectionResult[]
  clearResults: () => void
  isProcessing: boolean
}

// Result Card Component
const ResultCard: React.FC<{ result: DetectionResult }> = ({ result }) => {
  const [showDetails, setShowDetails] = useState(false)

  // Get appropriate icon based on file group
  const getIcon = (group: string) => {
    switch (group) {
      case 'image':
        return <FaFileImage className="text-3xl" />
      case 'audio':
        return <FaFileAudio className="text-3xl" />
      case 'video':
        return <FaFileVideo className="text-3xl" />
      case 'code':
        return <FaFileCode className="text-3xl" />
      case 'document':
        return <FaFilePdf className="text-3xl" />
      case 'archive':
        return <FaFileArchive className="text-3xl" />
      case 'text':
        return <FaFileAlt className="text-3xl" />
      default:
        return <FaQuestion className="text-3xl" />
    }
  }

  // Format file size
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  // Check if both engines detected the same file type
  const isVerified =
    result.magikaResult &&
    result.fileTypeResult &&
    result.magikaResult.label === result.fileTypeResult.label

  // Generate verification message
  const getVerificationMessage = () => {
    if (isVerified) {
      return 'Both detection engines agree on this file type'
    } else if (result.magikaResult && result.fileTypeResult) {
      // Check if file-type returned unknown or doesn't support the file type
      if (result.fileTypeResult.label === 'unknown' || !result.fileTypeResult.isSupported) {
        return "File-type engine doesn't support this file format. Using Magika detection."
      }
      // Check if Magika doesn't support the type detected by file-type
      else if (!result.magikaResult.rawResult.scores_map[result.fileTypeResult.label]) {
        return "Magika doesn't support the type detected by file-type engine. The file-type engine detection may be more accurate."
      } else {
        return 'The file format might be obfuscated as both engines detected different types.'
      }
    }

    // If only one engine has results
    if (result.magikaResult && !result.fileTypeResult) {
      return 'Only Magika engine was able to detect this file type.'
    }
    if (!result.magikaResult && result.fileTypeResult) {
      return 'Only file-type engine was able to detect this file type.'
    }

    return 'Detection based on limited information'
  }

  // Get score color class based on score value
  const getScoreColorClass = (score: number): string => {
    if (score >= 0.9) return 'text-success' // success
    if (score >= 0.7) return 'text-warning' // warning
    return 'text-error' // error
  }

  return (
    <div className="border-4 border-border bg-card-background rounded-none overflow-hidden transition-all shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000]">
      <div className="p-4 cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
        <div className="flex items-center mb-3">
          <div
            className={`w-12 h-12 rounded-none flex items-center justify-center mr-3 border-4 border-border bg-accent-color/20`}
          >
            {getIcon(result.detectedType.group)}
          </div>
          <div className="flex-1">
            <div className="text-sm font-['Press_Start_2P'] flex items-center">
              {result.detectedType.description || result.detectedType.label}

              {/* Verification indicator */}
              <div className="ml-2" title={getVerificationMessage()}>
                {isVerified ? (
                  <FaCheckCircle className="text-green-500" />
                ) : (
                  <FaExclamationTriangle className="text-amber-500" />
                )}
              </div>
            </div>
            <div className="text-xs opacity-70 font-['Press_Start_2P'] mt-1">
              {result.detectedType.mime_type}
            </div>
          </div>
        </div>

        <div className="space-y-3 text-xs border-t-2 border-border/20 py-3 font-['Press_Start_2P']">
          <div className="flex justify-between items-center">
            <span className="font-medium">Filename:</span>
            <span className="ml-2 truncate max-w-[150px] text-right">{result.fileName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Size:</span>
            <span>{formatFileSize(result.fileSize)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Score:</span>
            <span className={getScoreColorClass(result.score)}>
              {(result.score * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {showDetails && (
          <div className="mt-3 pt-3 border-t-2 border-border/20 text-xs space-y-2 font-['Press_Start_2P']">
            <div>
              <div className="font-medium">Detection Results:</div>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {/* Magika results */}
                {result.magikaResult && (
                  <div className="border-2 border-border p-2 rounded-none bg-accent-color/5">
                    <div className="font-medium text-center">- AI -</div>
                    <div className="mt-1 space-y-1 text-xs">
                      <div>Type: {result.magikaResult.label}</div>
                      <div>
                        Score:{' '}
                        <span className={getScoreColorClass(result.magikaResult.score)}>
                          {(result.magikaResult.score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* file-type results */}
                {result.fileTypeResult && (
                  <div className="border-2 border-border p-2 rounded-none bg-accent/5">
                    <div className="font-medium text-center">- Algo -</div>
                    <div className="mt-1 space-y-1 text-xs">
                      Type:
                      <div
                        className={result.fileTypeResult.label === 'unknown' ? 'text-error' : ''}
                      >
                        {result.fileTypeResult.label}
                      </div>
                      {result.fileTypeResult.isSupported && (
                        <div>
                          Supported: <span className="text-success">Yes</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="font-medium mt-3">Possible Extensions:</div>
            <div className="flex flex-wrap gap-1">
              {/* Combined list of all unique extensions */}
              {(() => {
                // Collect all extensions from both engines
                const magikaExts = result.magikaResult?.extensions || []
                const fileTypeExts =
                  result.fileTypeResult?.extensions && result.fileTypeResult.label !== 'unknown'
                    ? result.fileTypeResult.extensions
                    : []

                // Create a unique list of extensions
                const allExtensions = [...new Set([...magikaExts, ...fileTypeExts])]

                if (allExtensions.length === 0) {
                  return <span className="opacity-50">None available</span>
                }

                return allExtensions.map((ext, index) => (
                  <span
                    key={index}
                    className="bg-accent-color/10 px-2 py-1 rounded-none border-2 border-border"
                  >
                    .{ext}
                  </span>
                ))
              })()}
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="font-medium">Is Text?</span>
              <span>{result.detectedType.is_text ? 'Yes' : 'No'}</span>
            </div>

            {result.warningMessage && (
              <div className="mt-2 p-2 bg-amber-100 border-2 border-amber-400 text-amber-700 rounded-none">
                {result.warningMessage}
              </div>
            )}
          </div>
        )}

        <div className="mt-3 text-center">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowDetails(!showDetails)
            }}
            className="text-xs font-['Press_Start_2P'] text-accent-color border-2 border-border px-2 py-1 rounded-none hover:bg-accent-color/10 transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>
    </div>
  )
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  results,
  clearResults,
  isProcessing,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t-4 border-border pt-6"
    >
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h3 className="text-xl font-['Press_Start_2P']">Detection Results</h3>

        <button
          onClick={clearResults}
          disabled={isProcessing}
          className="px-4 py-2 bg-red-500/80 text-white rounded-none text-sm flex items-center gap-2 
            disabled:opacity-50 disabled:cursor-not-allowed 
            border-4 border-border font-['Press_Start_2P'] shadow-[4px_4px_0px_#000]
            hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]
            active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
        >
          <FaTrash size={12} />
          Clear Results
        </button>
      </div>

      <PixelScrollArea maxHeight="70vh" className="border-4 border-border p-4 bg-accent-color/5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
          {results.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      </PixelScrollArea>
    </motion.div>
  )
}
