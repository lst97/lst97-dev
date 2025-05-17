'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FaFileDownload, FaFileArchive, FaSpinner, FaTrash, FaTimes } from 'react-icons/fa'
import { ExtendedImageJob } from '../../hooks/types'
import { PixelCheckbox, PixelScrollArea } from '@/frontend/components/ui'
import { formatBytes } from '@/frontend/utils/formatBytes'

type ImageGalleryProps = {
  /** Array of image processing jobs to display. */
  jobs: ExtendedImageJob[]
  /** Callback function to remove a specific job by its ID. */
  removeJob: (id: string) => void
  /** Callback function to clear all jobs from the gallery. */
  clearAllJobs: () => void
  /** Optional callback to download a single processed image. */
  downloadImage?: (imageUrl?: string, fileName?: string) => void
  /** Optional callback to download all processed images as a ZIP file. */
  downloadAllImages?: () => void
  /** Optional callback to download selected processed images as a ZIP file. */
  downloadSelectedImages?: (jobIds: string[]) => void
  /** Optional flag indicating if a ZIP download is currently in progress. */
  isZipping?: boolean
}

/**
 * `ImageCard` displays a single image job with its status, preview, and actions.
 * It handles selection, removal, and individual download of images.
 */
const ImageCard = ({
  job,
  isSelected,
  onSelect,
  onRemove,
  onDownload,
}: {
  /** The image job data to display. */
  job: ExtendedImageJob
  /** Whether this card is currently selected. */
  isSelected: boolean
  /** Callback when the card's selection state changes. */
  onSelect: (id: string, checked: boolean) => void
  /** Callback when the remove button is clicked. */
  onRemove: () => void
  /** Optional callback to download the processed image for this card. */
  onDownload?: (imageUrl?: string, fileName?: string) => void
}) => {
  const hasProcessedImage = !!job.processedImageUrl && job.status === 'completed'
  const displayUrl = job.processedImageUrl || job.originalBlobUrl
  const isProcessing =
    job.status === 'segmentation' ||
    job.status === 'preparing' ||
    job.status === 'preprocessing' ||
    job.status === 'pending_postprocessing' ||
    job.status === 'postprocessing'

  // Determine if this job can be selected (only completed jobs with processed images)
  const isSelectable = hasProcessedImage

  return (
    <div
      className={`
        border-4 border-border
        ${
          isSelected
            ? 'bg-background/40 shadow-[6px_6px_0px_#000]'
            : 'bg-background/20 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000]'
        } 
        rounded-none overflow-hidden transition-all duration-200
        ${isSelected ? 'relative' : ''}
      `}
    >
      <div
        className="relative aspect-square bg-background/50 p-1 group cursor-pointer"
        onClick={(e) => {
          // Only handle click if it's not on the checkbox (to avoid double toggle)
          // and if the card is selectable (i.e., image processing is complete)
          if (!(e.target as HTMLElement).closest('.checkbox-container') && isSelectable) {
            onSelect(job.id, !isSelected)
          }
        }}
      >
        {/* Checkbox for multi-select in top-left corner, disabled if not selectable */}
        <div
          className={`absolute top-2 left-2 z-10 opacity-80 hover:opacity-100 transition-opacity checkbox-container
            ${!isSelectable ? 'opacity-30 pointer-events-none' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <PixelCheckbox
            checked={isSelected}
            onCheckedChange={(checked) => isSelectable && onSelect(job.id, checked)}
            className="bg-background/80"
            disabled={!isSelectable}
          />
        </div>

        {/* Close button to remove the image job */}
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="h-6 w-6 flex items-center justify-center shadow-lg bg-black/50 text-white hover:bg-error transition-colors"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {displayUrl ? (
          <Image src={displayUrl} alt={job.name} fill className="object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-xs text-gray-500">No preview</span>
          </div>
        )}

        {/* Visual indicator while image processing is in progress */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Status indicator displaying the current job status */}
        <div
          className={`absolute bottom-0 left-0 right-0 ${job.status === 'completed' ? 'bg-success/70' : ''} ${job.status === 'queued' ? 'bg-info/70' : ''} bg-border/70 ${job.status === 'error' ? 'bg-error/70' : ''} py-1 px-2`}
        >
          <span className="text-[10px] text-white font-['Press_Start_2P'] truncate block">
            {job.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center mb-3">
          <div
            className={`w-12 h-12 ${hasProcessedImage ? 'bg-accent-color' : 'bg-gray-400'} rounded-none flex items-center justify-center mr-3 border-2 border-border`}
          >
            {hasProcessedImage ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-xl"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-xl"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            )}
          </div>
          <div>
            <div className="font-['Press_Start_2P'] text-xs">Transparent PNG</div>
          </div>
        </div>

        <div className="space-y-3 font-['Press_Start_2P'] text-xs border-t-2 border-border/20 py-3">
          <div className="flex justify-between items-center text-[12px]">
            <span>Filename:</span>
            <span className="ml-2 truncate max-w-[150px] text-right">{job.name}</span>
          </div>
          <div className="flex justify-between items-center text-[12px]">
            <span className="font-medium">Size:</span>
            <div className="text-right">
              {job.status === 'completed' && job.processedFileSize ? (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] opacity-80">
                      Source: {formatBytes(job.file.size)}
                    </span>
                    <span className="text-info text-[10px]">
                      New: {formatBytes(job.processedFileSize)}
                    </span>
                  </div>
                </>
              ) : (
                formatBytes(job.file.size)
              )}
            </div>
          </div>
        </div>

        {hasProcessedImage && onDownload && (
          <div className="flex justify-end mt-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onDownload(job.processedImageUrl, job.name)}
              className="p-2 bg-accent-color rounded-none font-['Press_Start_2P'] text-xs flex items-center gap-2 
                border-4 border-border shadow-[4px_4px_0px_#000]
                hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]
                active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
            >
              <FaFileDownload />
              Download
            </button>
          </div>
        )}

        {job.error && (
          <div className="mt-3 p-2 bg-red-100 border-l-4 border-red-500 text-red-700 text-xs font-['Press_Start_2P']">
            {job.error}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * `ImageGallery` component displays a collection of image processing jobs.
 * It allows users to view image previews, statuses, and download processed images individually or in bulk.
 * Features include selecting multiple images, clearing all images, and downloading selected/all images as a ZIP.
 */
export const ImageGallery: React.FC<ImageGalleryProps> = ({
  jobs,
  removeJob,
  clearAllJobs,
  downloadImage,
  downloadAllImages,
  downloadSelectedImages,
  isZipping = false,
}) => {
  // Filter jobs to get only those that are completed and have a processed image URL.
  // These are the jobs that can be selected and downloaded.
  const selectableJobs = jobs.filter((job) => job.status === 'completed' && job.processedImageUrl)

  // State to keep track of the IDs of selected jobs.
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([])

  // Derived boolean states for easier conditional rendering and logic.
  // These are re-calculated on each render.
  const hasCompletedJobs = selectableJobs.length > 0
  const hasSelectedJobs = selectedJobIds.length > 0
  const allSelected = hasCompletedJobs && selectedJobIds.length === selectableJobs.length

  // Callback for the "Select All" checkbox.
  // Toggles selection of all selectable jobs.
  const handleSelectAllChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        // If checked, select all jobs that are currently selectable.
        setSelectedJobIds(selectableJobs.map((job) => job.id))
      } else {
        // If unchecked, clear all selections.
        setSelectedJobIds([])
      }
    },
    [selectableJobs], // Dependency: Re-create if selectableJobs changes.
  )

  // Callback for individual job selection.
  // Adds or removes a job ID from the selectedJobIds array.
  const handleSelectJob = useCallback((jobId: string, checked: boolean) => {
    setSelectedJobIds((prevSelectedIds) => {
      if (checked && !prevSelectedIds.includes(jobId)) {
        // If checked and not already selected, add to selection.
        return [...prevSelectedIds, jobId]
      } else if (!checked && prevSelectedIds.includes(jobId)) {
        // If unchecked and currently selected, remove from selection.
        return prevSelectedIds.filter((id) => id !== jobId)
      }
      // If no change is needed (e.g., trying to select an already selected item), return previous state.
      return prevSelectedIds
    })
  }, []) // No dependencies, as setSelectedJobIds updater form is stable.

  // Callback to initiate download of selected jobs.
  // Calls the downloadSelectedImages prop if available and jobs are selected.
  const handleDownloadSelected = useCallback(() => {
    if (downloadSelectedImages && selectedJobIds.length > 0) {
      console.log('Downloading selected jobs:', selectedJobIds) // Log: Initiating download for selected jobs
      downloadSelectedImages(selectedJobIds)
    }
  }, [downloadSelectedImages, selectedJobIds]) // Dependencies: Re-create if props or selectedJobIds change.

  // If there are no jobs, don't render anything.
  if (jobs.length === 0) {
    return null
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-['Press_Start_2P']">Uploaded Images</h3>

          {/* Only show selection controls if there are completed jobs that can be downloaded */}
          {hasCompletedJobs && (
            <div className="flex items-center">
              <PixelCheckbox
                checked={allSelected}
                onCheckedChange={handleSelectAllChange}
                label="Select All"
                labelClassName="text-xs"
              />

              {/* Display the count of currently selected jobs */}
              {hasSelectedJobs && (
                <span className="ml-4 font-['Press_Start_2P'] text-xs">
                  {selectedJobIds.length} selected
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Clear All Button: Removes all jobs from the gallery */}
          {jobs.length > 0 && (
            <button
              onClick={clearAllJobs}
              className="px-4 py-2 bg-error/50 rounded-none font-['Press_Start_2P'] text-sm flex items-center gap-2 transition-all 
                border-4 border-border shadow-[4px_4px_0px_#000]
                hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]
                active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
            >
              <FaTrash />
              Clear All
            </button>
          )}

          {/* Download Selected as ZIP button: Visible when jobs are selected and download function is provided */}
          {hasSelectedJobs && downloadSelectedImages && (
            <button
              onClick={handleDownloadSelected}
              disabled={isZipping}
              className="px-4 py-2 bg-info/50 rounded-none font-['Press_Start_2P'] text-sm flex items-center gap-2 transition-all 
                disabled:opacity-50 disabled:cursor-not-allowed
                border-4 border-border shadow-[4px_4px_0px_#000]
                hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]
                active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
            >
              {isZipping ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Creating ZIP...
                </>
              ) : (
                <>
                  <FaFileArchive />
                  Download Selected
                </>
              )}
            </button>
          )}

          {/* Download All as ZIP button: Visible when there are completed jobs and download function is provided */}
          {hasCompletedJobs && downloadAllImages && (
            <button
              onClick={downloadAllImages}
              disabled={isZipping}
              className="px-4 py-2 bg-accent-color rounded-none font-['Press_Start_2P'] text-sm flex items-center gap-2 transition-all 
                disabled:opacity-50 disabled:cursor-not-allowed
                border-4 border-border shadow-[4px_4px_0px_#000]
                hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]
                active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
            >
              {isZipping ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Creating ZIP...
                </>
              ) : (
                <>
                  <FaFileArchive />
                  Download All
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="border-4 border-border bg-card p-4">
        <PixelScrollArea maxHeight={600} className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pr-8">
            {jobs.map((job) => (
              <ImageCard
                key={job.id}
                job={job}
                isSelected={selectedJobIds.includes(job.id)} // Determine if the current card is selected
                onSelect={handleSelectJob}
                onRemove={() => removeJob(job.id)}
                onDownload={
                  // Only provide download function if the job is completed and has a processed image
                  job.processedImageUrl && job.status === 'completed' ? downloadImage : undefined
                }
              />
            ))}
          </div>
        </PixelScrollArea>
      </div>
    </motion.div>
  )
}
