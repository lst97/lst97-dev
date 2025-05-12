'use client'

import React from 'react'
import { SiJpeg } from 'react-icons/si'
import { TbFileTypePng, TbFileTypeJpg } from 'react-icons/tb'
import { FaImage } from 'react-icons/fa'
import { SupportedFormat } from '../../types'

export const formatIconMap: Record<SupportedFormat, React.ReactNode> = {
  'image/jpeg': <SiJpeg className="text-2xl" />,
  'image/png': <TbFileTypePng className="text-2xl" />,
  'image/webp': <FaImage className="text-2xl" />,
  'image/gif': <TbFileTypeJpg className="text-2xl" />,
  'image/heic': <FaImage className="text-2xl" />,
}
