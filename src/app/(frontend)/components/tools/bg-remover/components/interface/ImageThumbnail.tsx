'use client'

import React from 'react'
import Image from 'next/image'
import { FaTimes, FaCheck } from 'react-icons/fa'
import { ExtendedImageJob } from '../../hooks/types'

type ImageThumbnailProps = {
  job: ExtendedImageJob
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
}

export const ImageThumbnail: React.FC<ImageThumbnailProps> = ({
  job,
  isSelected,
  onSelect,
  onRemove,
}) => {
  return (
    <div
      id={`thumbnail-${job.id}`}
      onClick={onSelect}
      className={`relative rounded-sm overflow-hidden cursor-pointer transition-all border-2 border-dashed
        ${isSelected ? 'border-border border-solid border-4 shadow-lg' : 'border-border hover:border-accent-color/70'}
      `}
    >
      <div className="aspect-square relative">
        {job.processedImageUrl ? (
          <Image src={job.processedImageUrl} alt={job.name} fill className="object-cover" />
        ) : job.originalBlobUrl ? (
          <Image src={job.originalBlobUrl} alt={job.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-500">No preview</span>
          </div>
        )}
      </div>
      <div className="absolute top-2 right-2">
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
      {job.processedImageUrl && (
        <div className="absolute bottom-2 right-2">
          <div className="h-6 w-6 flex items-center justify-center rounded-full bg-accent-color text-white">
            <FaCheck className="text-xs" />
          </div>
        </div>
      )}
      {(job.status === 'segmentation' ||
        job.status === 'preparing' ||
        job.status === 'preprocessing' ||
        job.status === 'pending_postprocessing' ||
        job.status === 'postprocessing') && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Status indicator */}
      <div className={`absolute bottom-0 left-0 right-0  bg-border/70 py-1 px-2`}>
        <span className="text-[10px] text-white font-['Press_Start_2P'] truncate block">
          {job.status.replace('_', ' ')}
        </span>
      </div>
    </div>
  )
}
