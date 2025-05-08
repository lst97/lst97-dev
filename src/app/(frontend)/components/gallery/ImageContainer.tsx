'use client'

import React, { memo, ReactNode } from 'react'
import Image from 'next/image'
import { PixelContainer } from '../common/layout/Containers'
import { ImageEmbeddedInfo, ImageInfoAction } from './ImageInfo'

interface ImageContainerProps {
  children: ReactNode
  className?: string
}

export const ImageContainer = memo(({ children, className = '' }: ImageContainerProps) => {
  // Memoize child finding operations
  const [imageChild, infoChild, infoActionChild] = React.useMemo(() => {
    const findChild = (type: React.ElementType) =>
      React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.type === type,
      )

    return [findChild(Image), findChild(ImageEmbeddedInfo), findChild(ImageInfoAction)]
  }, [children])

  return (
    <PixelContainer className={` ${className}`}>
      <div className="m-4 shadow-[4px_4px_0px_0px_gray]">{imageChild}</div>
      {infoChild && (
        <div className="flex flex-row justify-between items-center text-center">
          <div className="grow">{infoChild}</div>
          <div className="shrink-0 ml-2">{infoActionChild}</div>
        </div>
      )}
    </PixelContainer>
  )
})

ImageContainer.displayName = 'ImageContainer'
