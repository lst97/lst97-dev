'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ExtendedImageJob } from '../../hooks/types'
import { PixelProgressBar } from '@/frontend/components/ui/ProgressBar'

/**
 * Retrieves a human-readable string representation for a given image processing job status.
 * This function maps internal status codes (e.g., 'queued', 'preprocessing') to user-friendly text
 * that can be displayed in the UI to inform the user about the current state of an image job.
 *
 * @param status - The status of the image job, as defined by `ExtendedImageJob['status']`.
 * @returns A string describing the job status. Returns 'Unknown' if the status is not recognized.
 */
const getStatusText = (status: ExtendedImageJob['status']): string => {
  switch (status) {
    case 'queued':
      return 'Waiting to process'
    case 'preprocessing':
      return 'Preprocessing image'
    case 'pending_preprocessing':
      return 'Waiting for preprocessing'
    case 'preparing':
      return 'Preparing image'
    case 'pending_segmentation':
      return 'Waiting for processing'
    case 'segmentation':
      return 'Removing background'
    case 'pending_postprocessing':
      return 'Waiting for finishing'
    case 'postprocessing':
      return 'Finishing up'
    case 'completed':
      return 'Completed'
    case 'error':
      return 'Error'
    default:
      return 'Unknown'
  }
}

type JobProgressListProps = {
  jobs: ExtendedImageJob[]
}

const JobProgressList: React.FC<JobProgressListProps> = ({ jobs }) => {
  const jobData = useMemo(() => {
    const newData = {
      totalCount: jobs.length,
      queuedCount: 0,
      activePreprocessingCount: 0,
      activeSegmentationCount: 0,
      activePostprocessingCount: 0,
      completedCount: 0,
      errorCount: 0,
      numFinishedPreprocessing: 0,
      numFinishedSegmentation: 0,
      numFinishedPostprocessing: 0,
    }

    if (jobs.length === 0) return newData

    jobs.forEach((job) => {
      // Update status counts for UI text
      if (job.status === 'queued') newData.queuedCount++
      if (job.status === 'completed') newData.completedCount++
      if (job.status === 'error') newData.errorCount++

      if (job.status === 'pending_preprocessing' || job.status === 'preprocessing') {
        newData.activePreprocessingCount++
      }
      if (
        job.status === 'pending_segmentation' ||
        job.status === 'preparing' ||
        job.status === 'segmentation'
      ) {
        newData.activeSegmentationCount++
      }
      if (job.status === 'pending_postprocessing' || job.status === 'postprocessing') {
        newData.activePostprocessingCount++
      }

      // Update counts for images that have FINISHED a specific stage
      // An image is considered to have finished preprocessing if its status
      // is beyond the initial preprocessing stages or is 'queued' (implying preprocessing is done or skipped).
      if (
        [
          'pending_segmentation',
          'preparing',
          'segmentation',
          'pending_postprocessing',
          'postprocessing',
          'completed',
          'queued',
        ].includes(job.status)
      ) {
        newData.numFinishedPreprocessing++
      }
      // An image is considered to have finished segmentation if its status
      // indicates it has moved to postprocessing or is completed.
      if (['pending_postprocessing', 'postprocessing', 'completed'].includes(job.status)) {
        newData.numFinishedSegmentation++
      }
    })
    // The number of images that finished postprocessing is equivalent to the completed count.
    newData.numFinishedPostprocessing = newData.completedCount

    return newData
  }, [jobs])

  const overallProgress = useMemo(() => {
    if (jobData.totalCount === 0) return 0
    const completedJobsValue = jobData.completedCount * 100
    const erroredJobsValue = jobData.errorCount * 100

    let inProgressValue = 0
    jobs.forEach((job) => {
      if (
        job.status !== 'completed' &&
        job.status !== 'error' &&
        job.status !== 'queued' &&
        job.status !== 'pending_preprocessing'
      ) {
        if (job.status === 'preprocessing') inProgressValue += 15
        else if (job.status === 'pending_segmentation' || job.status === 'preparing')
          inProgressValue += 33
        else if (job.status === 'segmentation') inProgressValue += 50
        else if (job.status === 'pending_postprocessing') inProgressValue += 66
        else if (job.status === 'postprocessing') inProgressValue += 85
      }
      // Add progress for queued jobs (which are considered to have completed preprocessing)
      else if (job.status === 'queued') {
        inProgressValue += 15
      }
    })

    if (jobData.totalCount === 0) return 0
    return Math.round(
      (completedJobsValue + erroredJobsValue + inProgressValue) / jobData.totalCount,
    )
  }, [jobData, jobs])

  const currentStage = useMemo(() => {
    // Prioritize active states for the current stage text
    if (jobs.some((j) => j.status === 'preprocessing')) return 'preprocessing'
    if (jobs.some((j) => j.status === 'segmentation' || j.status === 'preparing'))
      return 'segmentation'
    if (jobs.some((j) => j.status === 'postprocessing')) return 'postprocessing'

    // Fallback to pending states if no active processing found by specific status
    if (jobData.activePreprocessingCount > 0) return 'preprocessing'
    if (jobData.activeSegmentationCount > 0) return 'segmentation'
    if (jobData.activePostprocessingCount > 0) return 'postprocessing'

    if (jobData.queuedCount > 0) return 'queued'
    if (jobData.totalCount > 0 && jobData.completedCount === jobData.totalCount) return 'completed'
    return null
  }, [jobData, jobs])

  if (jobs.length === 0) {
    return null
  }

  const progressContainerHeight = 24
  const progressBarHeight = progressContainerHeight - 8

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 mt-4"
    >
      <h3 className="mb-4 font-['Press_Start_2P'] text-lg">Processing Progress</h3>

      <div className="px-4 py-5 bg-card-background border-4 border-border rounded-none shadow-[4px_4px_0px_#000]">
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="text-sm font-['Press_Start_2P']">
              {currentStage ? getStatusText(currentStage as ExtendedImageJob['status']) : 'Ready'}
            </div>
            <div className="text-lg font-['Press_Start_2P'] mt-2">{overallProgress}% Complete</div>
          </div>

          <div className="font-['Press_Start_2P'] text-sm flex flex-wrap gap-4">
            <div className="flex items-center">
              <span className="inline-block h-3 w-3 bg-accent-color mr-2 border border-border"></span>
              <span>Queued: {jobData.queuedCount}</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block h-3 w-3 bg-warning mr-2 border border-border"></span>
              <span>
                Processing:{' '}
                {jobData.activePreprocessingCount +
                  jobData.activeSegmentationCount +
                  jobData.activePostprocessingCount}
              </span>
            </div>
            <div className="flex items-center">
              <span className="inline-block h-3 w-3 bg-success mr-2 border border-border"></span>
              <span>Completed: {jobData.completedCount}</span>
            </div>
            {jobData.errorCount > 0 && (
              <div className="flex items-center">
                <span className="inline-block h-3 w-3 bg-error mr-2 border border-border"></span>
                <span>Errors: {jobData.errorCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Overall Progress Bar showing the three distinct stages: Preprocessing, Segmentation, and Postprocessing */}
        <div
          className="flex w-full rounded-none overflow-hidden"
          style={{ height: `${progressContainerHeight}px` }}
        >
          <div className="w-1/3 h-full">
            <PixelProgressBar
              value={jobData.numFinishedPreprocessing}
              max={jobData.totalCount}
              height={progressBarHeight}
              animated={true}
              className="w-full !p-0 !border-l-4 !border-t-4 !border-b-4 !border-r-0 !border-border !rounded-none"
              progressClassName="bg-[var(--color-progress-preprocess)]"
            />
          </div>
          <div className="w-1/3 h-full">
            <PixelProgressBar
              value={jobData.numFinishedSegmentation}
              max={jobData.totalCount}
              height={progressBarHeight}
              animated={true}
              className="w-full !p-0 !border-t-4 !border-b-4 !border-l-2 !border-r-2 !border-border !rounded-none"
              progressClassName="bg-[var(--color-progress-segment)]"
            />
          </div>
          <div className="w-1/3 h-full">
            <PixelProgressBar
              value={jobData.numFinishedPostprocessing}
              max={jobData.totalCount}
              height={progressBarHeight}
              animated={true}
              className="w-full !p-0 !border-l-0 !border-t-4 !border-b-4 !border-r-4 !border-border !rounded-none"
              progressClassName="bg-[var(--color-progress-postprocess)]"
            />
          </div>
        </div>

        {/* Stage Indicators: Text labels for each stage of the progress bar */}
        <div className="flex justify-between mt-2 font-['Press_Start_2P'] text-xs">
          <div
            className={
              currentStage === 'preprocessing' ? 'text-[var(--color-progress-preprocess)]' : ''
            }
          >
            Preprocessing
          </div>
          <div
            className={
              currentStage === 'segmentation' ? 'text-[var(--color-progress-segment)]' : ''
            }
          >
            Segmentation
          </div>
          <div
            className={
              currentStage === 'postprocessing' ? 'text-[var(--color-progress-postprocess)]' : ''
            }
          >
            Postprocessing
          </div>
        </div>

        {/* Completion Statistics: Displays the count of completed images versus the total number of images */}
        <div className="mt-4 font-['Press_Start_2P'] text-xs text-right">
          {jobData.completedCount} of {jobData.totalCount} images completed
        </div>
      </div>
    </motion.div>
  )
}

export default JobProgressList
