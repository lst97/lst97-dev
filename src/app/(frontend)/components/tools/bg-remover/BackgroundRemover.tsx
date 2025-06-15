'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useBackgroundRemovalController } from './hooks'
import type { RawModelProgressData, ModelProgressTypeForComponent } from './components/engine/types'
import type { ExtendedImageJob } from './hooks/types'

import {
  UploadSection,
  ImageGallery,
  ProcessingNotice,
  ModelLoadingProgress,
  JobProgressList,
  BackgroundControl,
  VersionInfo,
} from './components/interface'
import { CompatibilityCheck } from './components/interface/CompatibilityCheck'
import { Accordion } from '@/frontend/components/ui/Accordion'

/**
 * Props for the BackgroundRemover component.
 */
type BackgroundRemoverProps = {
  /** Optional CSS class name for custom styling. */
  className?: string
}

/**
 * BackgroundRemover component provides a UI for users to upload images,
 * remove their backgrounds using a machine learning model, and download the processed images.
 * It handles model loading, batch processing, individual image processing, and error display.
 */
export const BackgroundRemover: React.FC<BackgroundRemoverProps> = ({ className: _className }) => {
  // Background color state
  const [backgroundColor, setBackgroundColor] = useState<string | null>(null)
  const [backgroundColorAlpha, setBackgroundColorAlpha] = useState<number>(1.0)
  // Background image state
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null)
  const [backgroundImageAlpha, setBackgroundImageAlpha] = useState<number>(1.0)

  const {
    modelLoading,
    modelLoaded,
    imageList,
    overallError,
    isBatchActive,
    handleFileChange,
    handleStartBatchProcess,
    downloadImage,
    createAndDownloadZip,
    hasPendingOrQueuedJobs,
    remainingJobCount,
    clearAllJobs,
    removeJob,
    setImageList,
    segmentationController,
    webGLSupported,
    webGPUSupported,
    compatibilityChecked,
    reprocessCompletedImages,
  } = useBackgroundRemovalController(
    backgroundColor,
    backgroundImageUrl,
    backgroundImageAlpha,
    backgroundColorAlpha,
  )

  // New state for zipping status
  const [isZipping, setIsZipping] = useState<boolean>(false)
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
    setIsMobile(mobileRegex.test(userAgent))
  }, [])

  // Handle background color change (UI only, no reprocessing)
  const handleBackgroundColorChange = useCallback(
    (color: string | null, alpha: number = 1.0) => {
      setBackgroundColor(color)
      setBackgroundColorAlpha(alpha)

      // Update existing jobs with the new background color (for future processing)
      setImageList((prevList: ExtendedImageJob[]) =>
        prevList.map((job: ExtendedImageJob) => ({
          ...job,
          backgroundColor: color,
          backgroundColorAlpha: alpha,
        })),
      )
    },
    [setImageList],
  )

  // Handle background image change (UI only, no reprocessing)
  const handleBackgroundImageChange = useCallback(
    (imageUrl: string | null, alpha: number = 1.0) => {
      setBackgroundImageUrl(imageUrl)
      setBackgroundImageAlpha(alpha)

      // Update existing jobs with the new background image (for future processing)
      setImageList((prevList: ExtendedImageJob[]) =>
        prevList.map((job: ExtendedImageJob) => ({
          ...job,
          backgroundImageUrl: imageUrl,
          backgroundImageAlpha: alpha,
        })),
      )
    },
    [setImageList],
  )

  // Handle background color application (triggers reprocessing)
  const handleApplyBackgroundColor = useCallback(
    (color: string | null, alpha: number = 1.0) => {
      // Update the background color state
      setBackgroundColor(color)
      setBackgroundColorAlpha(alpha)
      // Clear background image when applying color
      setBackgroundImageUrl(null)

      // Update existing jobs with the new background color
      setImageList((prevList: ExtendedImageJob[]) =>
        prevList.map((job: ExtendedImageJob) => ({
          ...job,
          backgroundColor: color,
          backgroundColorAlpha: alpha,
          backgroundImageUrl: null,
          backgroundImageAlpha: undefined,
        })),
      )

      // Reprocess only completed images with the new background color
      reprocessCompletedImages()
    },
    [setImageList, reprocessCompletedImages],
  )

  // Handle background image application (triggers reprocessing)
  const handleApplyBackgroundImage = useCallback(
    (imageUrl: string | null, alpha: number = 1.0) => {
      // Update the background image state
      setBackgroundImageUrl(imageUrl)
      // Clear background color when applying image
      setBackgroundColor(null)

      // Update existing jobs with the new background image
      setImageList((prevList: ExtendedImageJob[]) =>
        prevList.map((job: ExtendedImageJob) => ({
          ...job,
          backgroundImageUrl: imageUrl,
          backgroundImageAlpha: alpha,
          backgroundColor: null,
        })),
      )

      // Reprocess only completed images with the new background image
      reprocessCompletedImages()
    },
    [setImageList, reprocessCompletedImages],
  )

  const rawProgressData = segmentationController?.modelLoadingProgress
    ?.progress as RawModelProgressData
  const currentModelStatus =
    segmentationController?.modelLoadingProgress?.status || 'Initializing model...'

  let progressForModelComponent: ModelProgressTypeForComponent = 0 // Default to 0 percent

  if (typeof rawProgressData === 'number') {
    progressForModelComponent = rawProgressData
  } else if (typeof rawProgressData === 'object' && rawProgressData !== null) {
    if (typeof rawProgressData.progress === 'number') {
      progressForModelComponent = {
        progress: rawProgressData.progress,
        loaded: rawProgressData.loaded,
        total: rawProgressData.total,
        status: rawProgressData.status,
        file: rawProgressData.file,
      }
    } else if (
      typeof rawProgressData.loaded === 'number' &&
      typeof rawProgressData.total === 'number' &&
      rawProgressData.total > 0 // Ensure total is not zero to prevent division by zero
    ) {
      progressForModelComponent = {
        loaded: rawProgressData.loaded,
        total: rawProgressData.total,
        status: rawProgressData.status,
        file: rawProgressData.file,
      }
    }
    // If neither of the above, progressForModelComponent remains the default (e.g., 0 or a previously valid state if this logic were in a useEffect)
  }

  // For UploadSection component (assuming it wants a numeric percentage for its 'modelLoadingProgress' prop)
  let numericProgressForUploadSection = 0
  if (typeof rawProgressData === 'number') {
    numericProgressForUploadSection = rawProgressData
  } else if (typeof rawProgressData === 'object' && rawProgressData !== null) {
    if (typeof rawProgressData.progress === 'number') {
      numericProgressForUploadSection = rawProgressData.progress
    } else if (
      typeof rawProgressData.loaded === 'number' &&
      typeof rawProgressData.total === 'number' &&
      rawProgressData.total > 0
    ) {
      numericProgressForUploadSection = Math.min(
        (rawProgressData.loaded / rawProgressData.total) * 100,
        100,
      )
    }
  }

  /**
   * Downloads all successfully processed images as a single ZIP file.
   * Filters for jobs that have a processedImageUrl and are marked as 'completed'.
   */
  const downloadAllImages = useCallback(async () => {
    const processedJobs = imageList.filter(
      (job) => job.processedImageUrl && job.status === 'completed',
    )
    if (processedJobs.length === 0) {
      console.warn('No processed images available to download.')
      return
    }

    setIsZipping(true)
    console.log('Starting download of all processed images...')
    try {
      await createAndDownloadZip(processedJobs, 'bg-removed-images.zip')
      console.log('Successfully created and initiated download for all images zip.')
    } catch (error) {
      console.error('Error downloading all images:', error)
    } finally {
      setIsZipping(false)
    }
  }, [imageList, createAndDownloadZip])

  /**
   * Downloads selected successfully processed images as a single ZIP file.
   * @param jobIds An array of job IDs to be included in the ZIP file.
   */
  const downloadSelectedImages = useCallback(
    async (jobIds: string[]) => {
      if (jobIds.length === 0) return

      setIsZipping(true)
      console.log(`Starting download for ${jobIds.length} selected images...`)

      try {
        const selectedJobs = imageList.filter(
          (job) => job.processedImageUrl && job.status === 'completed' && jobIds.includes(job.id),
        )

        if (selectedJobs.length === 0) {
          console.warn('No processed images found in selection for download.')
          return
        }

        const zipFilename =
          selectedJobs.length === 1
            ? `bg-removed-${selectedJobs[0].name.split('.')[0]}.zip`
            : `bg-removed-selected-${selectedJobs.length}.zip`

        await createAndDownloadZip(selectedJobs, zipFilename)
        console.log(
          `Successfully created and initiated download for selected images zip: ${zipFilename}`,
        )
      } catch (error) {
        console.error('Error downloading selected images:', error)
      } finally {
        setIsZipping(false)
      }
    },
    [imageList, createAndDownloadZip],
  )

  // Calculate active processing job count
  const activeProcessingCount = imageList.filter(
    (job) =>
      job.status !== 'completed' &&
      job.status !== 'error' &&
      job.status !== 'pending_preprocessing' &&
      job.status !== 'pending_segmentation' &&
      job.status !== 'pending_postprocessing',
  ).length

  // Determine if processing notice should be shown
  const isProcessingInProgress = imageList.some(
    (job) =>
      job.status !== 'completed' &&
      job.status !== 'error' &&
      job.status !== 'pending_preprocessing',
  )

  // Check if there are any completed images for background color application
  const hasCompletedImages = imageList.some((job) => job.status === 'completed')

  return (
    <div className="bg-card w-full max-w-6xl mx-auto p-8 border-4 border-border shadow-[8px_8px_0_#000] rounded-none px-2 md:px-8 relative">
      {/* Version Info */}
      <VersionInfo />

      <div className="flex items-center justify-between mb-8 relative">
        <div className="flex-grow">
          <h2 className="text-2xl font-['Press_Start_2P'] text-center">Background Remover</h2>
        </div>
        {compatibilityChecked && (
          <div className="flex-shrink-0 ml-4">
            <CompatibilityCheck webGLSupported={webGLSupported} webGPUSupported={webGPUSupported} />
          </div>
        )}
      </div>

      {/* Mobile Device Warning */}
      {isMobile && (
        <div
          className="mb-6 p-4 bg-yellow-100 border-4 border-yellow-400 text-yellow-700 font-['Press_Start_2P'] text-sm shadow-[4px_4px_0px_#000] rounded-none"
          role="alert"
        >
          <h3 className="font-bold mb-2 text-yellow-800">Mobile Device Detected</h3>
          <p className="text-xs">
            This tool is not optimized for mobile devices and may experience errors or performance
            issues due to model size and resource limitations. For the best experience, please use a
            desktop browser.
          </p>
        </div>
      )}

      {/* Browser Compatibility Warning */}
      {compatibilityChecked && !webGLSupported && (
        <div
          className="mb-6 p-4 bg-amber-100 border-4 border-amber-400 text-amber-700 font-['Press_Start_2P'] text-sm shadow-[4px_4px_0px_#000] rounded-none"
          role="alert"
        >
          <h3 className="font-bold mb-2 text-amber-800">Browser Compatibility Issue</h3>
          <p className="text-xs">
            Your browser does not support WebGL, which is required for this tool to function. Please
            consider using Google Chrome for the best experience.
          </p>
        </div>
      )}

      {/* Show model loading progress when the model is loading */}
      {modelLoading && (
        <ModelLoadingProgress
          isLoading={modelLoading}
          progress={progressForModelComponent}
          status={currentModelStatus}
        />
      )}

      {/* Upload section */}
      <UploadSection
        onFileUpload={handleFileChange}
        modelLoaded={modelLoaded}
        modelLoading={modelLoading}
        isBatchActive={isBatchActive}
        hasPendingOrQueuedJobs={hasPendingOrQueuedJobs}
        onStartBatch={handleStartBatchProcess}
        remainingJobCount={remainingJobCount}
        modelLoadingProgress={numericProgressForUploadSection}
        modelLoadingStatus={currentModelStatus}
        disabled={compatibilityChecked && !webGLSupported}
      />

      {/* Accordion Sections */}
      {imageList.length > 0 && (
        <Accordion type="multiple" defaultValue={['processing', 'images']} className="mt-6">
          {/* Background Options Section */}
          <Accordion.Item value="background" title="Background Options">
            <BackgroundControl
              onBackgroundColorChange={handleBackgroundColorChange}
              onApplyBackgroundColor={handleApplyBackgroundColor}
              onBackgroundImageChange={handleBackgroundImageChange}
              onApplyBackgroundImage={handleApplyBackgroundImage}
              disabled={compatibilityChecked && !webGLSupported}
              hasCompletedImages={hasCompletedImages}
            />
          </Accordion.Item>

          {/* Processing Progress Section */}
          <Accordion.Item value="processing" title="Progress">
            {/* Processing notice for potential UI lag */}
            <ProcessingNotice isVisible={isProcessingInProgress} jobCount={activeProcessingCount} />

            {/* Job processing progress */}
            <JobProgressList jobs={imageList} />

            {/* Error message */}
            {overallError && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-100 border-4 border-red-400 text-red-700 font-['Press_Start_2P'] text-sm shadow-[4px_4px_0px_#000]"
              >
                {overallError}
              </motion.div>
            )}
          </Accordion.Item>

          {/* Uploaded Images Section */}
          <Accordion.Item value="images" title="Uploaded Images">
            <ImageGallery
              jobs={imageList}
              removeJob={removeJob}
              clearAllJobs={clearAllJobs}
              downloadImage={downloadImage}
              downloadAllImages={downloadAllImages}
              downloadSelectedImages={downloadSelectedImages}
              isZipping={isZipping}
              disabled={compatibilityChecked && !webGLSupported}
            />
          </Accordion.Item>
        </Accordion>
      )}
    </div>
  )
}

export default BackgroundRemover
