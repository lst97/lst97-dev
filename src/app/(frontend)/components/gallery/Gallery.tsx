'use client'

import React, { memo } from 'react'
import Image from 'next/image'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid'
import { CloseIconButton } from '../ui/Buttons'
import { PixelContainer } from '../common/layout/Containers'
import { PkmImageViewer } from './ImageViewer'
import { GalleryProps } from './types'

interface GalleryHeaderProps {
  dimension?: { x: number; y: number }
  byte?: number
  date?: string
  name?: string
  onClose?: () => void
}

const GalleryHeader = memo(({ dimension, byte, date, name, onClose }: GalleryHeaderProps) => {
  const title = React.useMemo(() => {
    const dimensionStr = dimension?.x ? `${dimension?.x} x ${dimension?.y} | ` : ''
    const byteStr = byte ? `${byte} bytes | ` : ''
    const dateStr = date ? `${date} | ` : ''
    const nameStr = name ? `${name} | ` : ''
    return `${dimensionStr}${byteStr}${dateStr}${nameStr}PkmImageGallery`
  }, [dimension, byte, date, name])

  return (
    <div className="bg-amber-200 rounded-t-md border-b-2 border-black h-12">
      <div className="flex flex-row justify-between w-full h-full justify-between items-center">
        <div className="text-md ml-2">{title}</div>
        <div className="relative w-12 border-l-2 border-black h-full hover:bg-amber-300 rounded-tr-md">
          <CloseIconButton onClick={onClose} className="rounded-md h-full w-full" />
        </div>
      </div>
    </div>
  )
})

GalleryHeader.displayName = 'GalleryHeader'

const GalleryThumbnail = memo(
  ({
    src,
    onClick,
    selected,
  }: Readonly<{
    src: string
    onClick: () => void
    selected: boolean
  }>) => (
    <div className="flex flex-row gap-2 items-center justify-center">
      <div className={`${selected ? 'text-xl' : 'hidden'}`}>►</div>
      <div className="flex items-center justify-center rounded-md border-4 border-double border-black h-full shadow-md">
        <Image
          src={src}
          alt="thumbnail"
          width={1920}
          height={1080}
          onClick={onClick}
          className="hover:cursor-pointer rounded-md"
        />
      </div>
    </div>
  ),
)

GalleryThumbnail.displayName = 'GalleryThumbnail'

const GalleryOverview = memo(
  ({
    srcs,
    selectedIdx,
    onThumbnailClick,
  }: {
    srcs: string[]
    selectedIdx: number
    onThumbnailClick: (idx: number) => void
  }) => {
    const displayThumbnails = React.useMemo(
      () =>
        srcs
          .slice(0, 6)
          .map((src, idx) => (
            <GalleryThumbnail
              key={`thumbnail-${idx}`}
              src={src}
              onClick={() => onThumbnailClick(idx)}
              selected={selectedIdx === idx}
            />
          )),
      [srcs, selectedIdx, onThumbnailClick],
    )

    if (selectedIdx !== -1) return null

    return (
      <PixelContainer className="relative p-2">
        <div className="grid grid-cols-3 gap-4">{displayThumbnails}</div>
        {srcs.length > 6 && (
          <div className="absolute top-0 right-0 h-full w-1/5 bg-linear-to-l from-amber-300 via-amber-200 pointer-events-none opacity-50 flex justify-center items-center rounded-tr-md rounded-br-md">
            <p className="text-6xl font-bold">{`+ ${srcs.length - 6}`}</p>
          </div>
        )}
      </PixelContainer>
    )
  },
)

GalleryOverview.displayName = 'GalleryOverview'

export const PkmImageGallery = memo(({ srcs, onChange, onClose }: Readonly<GalleryProps>) => {
  const [selectedIdx, setSelectedIdx] = React.useState(-1)

  const handleGalleryClose = React.useCallback(() => {
    onClose?.()
    setSelectedIdx(-1)
  }, [onClose])

  const handleThumbnailClick = React.useCallback(
    (idx: number) => {
      onChange?.(idx)
      setSelectedIdx(idx)
    },
    [onChange],
  )

  const handlePrevious = React.useCallback(() => {
    if (selectedIdx > 0) {
      handleThumbnailClick(selectedIdx - 1)
    }
  }, [selectedIdx, handleThumbnailClick])

  const handleNext = React.useCallback(() => {
    if (selectedIdx < srcs.length - 1) {
      handleThumbnailClick(selectedIdx + 1)
    }
  }, [selectedIdx, srcs.length, handleThumbnailClick])

  const thumbnails = React.useMemo(
    () =>
      srcs.map((src, idx) => (
        <GalleryThumbnail
          key={`thumbnail-${idx}`}
          src={src}
          onClick={() => handleThumbnailClick(idx)}
          selected={selectedIdx === idx}
        />
      )),
    [srcs, selectedIdx, handleThumbnailClick],
  )

  return (
    <>
      <GalleryOverview
        srcs={srcs}
        selectedIdx={selectedIdx}
        onThumbnailClick={handleThumbnailClick}
      />

      {selectedIdx !== -1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-amber-100 bg-opacity-40 backdrop-blur-md">
          <div className="flex justify-center items-center min-w-24 min-h-24">
            <PixelContainer className="shadow-lg h-screen">
              <GalleryHeader onClose={handleGalleryClose} />
              <div className="flex flex-row mx-4 gap-4">
                <div className="relative basis-3/4 flex justify-center items-center">
                  <div className="absolute">
                    <PkmImageViewer
                      src={srcs[selectedIdx]}
                      stayOnTop={false}
                      maxSize={{ x: 1920, y: 1080 }}
                      open={selectedIdx !== -1}
                    />
                    <PixelContainer className="absolute top-1/2 right-0 h-24 w-12 -translate-y-1/2 opacity-50 flex items-center justify-center mx-4 hover:bg-amber-300 hover:opacity-100 hover:shadow-md hover:cursor-pointer">
                      <ChevronRightIcon onClick={handleNext} />
                    </PixelContainer>
                    <PixelContainer className="absolute top-1/2 left-0 h-24 w-12 -translate-y-1/2 opacity-50 flex items-center justify-center mx-4 hover:bg-amber-300 hover:opacity-100 hover:shadow-md hover:cursor-pointer">
                      <ChevronLeftIcon onClick={handlePrevious} />
                    </PixelContainer>
                  </div>
                </div>
                <div className="basis-1/4 h-screen">
                  <div className="flex flex-col justify-between items-center w-full h-full overflow-y-auto">
                    <div className="grid grid-cols-1 gap-4 first:mt-4">
                      {thumbnails}
                      <div className="h-14"></div>
                    </div>
                    <div className="flex justify-center items-center">
                      <PixelContainer className="absolute bottom-4 right-4/5 translate-x-1/2 p-1 bg-amber-200 mt-4 opacity-60 hover:opacity-100 hover:shadow-md">
                        <p className="px-2">
                          {selectedIdx + 1} / {srcs.length}
                        </p>
                      </PixelContainer>
                    </div>
                  </div>
                </div>
              </div>
            </PixelContainer>
          </div>
        </div>
      )}
    </>
  )
})

PkmImageGallery.displayName = 'PkmImageGallery'
