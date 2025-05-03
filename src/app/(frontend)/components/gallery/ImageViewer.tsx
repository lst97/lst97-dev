'use client'

import React, { memo } from 'react'
import Image from 'next/image'
import { CloseIconButton } from '../ui/Buttons'
import { ImageContainer } from './ImageContainer'
import { ImageEmbeddedInfo, ImageInfoAction } from './ImageInfo'
import { ImageViewerProps } from './types'

export const PkmImageViewer = memo(
  ({
    src,
    open = true,
    info,
    action,
    maxSize,
    onClose,
    stayOnTop = false,
  }: Readonly<ImageViewerProps>) => {
    const containerClasses = React.useMemo(() => {
      const stayOnTopClass = stayOnTop
        ? 'fixed inset-0 backdrop-blur-md bg-amber-100 bg-opacity-80 '
        : ''

      const stayOnTopContainerClass = stayOnTop ? 'bg-amber-200 p-4 rounded-md shadow-2xl' : ''

      return {
        stayOnTopClass,
        stayOnTopContainerClass,
      }
    }, [stayOnTop])

    if (!open || src === '') {
      return null
    }

    return (
      <div className="relative">
        <div className={`flex justify-center items-center ${containerClasses.stayOnTopClass}`}>
          <div className={`shadow-md ${containerClasses.stayOnTopContainerClass}`}>
            <ImageContainer>
              <Image
                src={src}
                alt={info?.alternativeText ?? ''}
                width={maxSize.x}
                height={maxSize.y}
              />
              {info && <ImageEmbeddedInfo info={info} />}
              {action && <ImageInfoAction action={action} />}

              {stayOnTop && <CloseIconButton className="rounded-md" onClick={onClose} />}
            </ImageContainer>
          </div>
        </div>
      </div>
    )
  },
)

PkmImageViewer.displayName = 'PkmImageViewer'
