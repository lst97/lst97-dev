'use client'

import React from 'react'
import Image from 'next/image'
import { motion, Variants } from 'framer-motion'
import { ValueItem } from '@/frontend/constants/data/vap'

interface ValueCardProps {
  item: ValueItem
  variants: Variants
}

export const ValueCard: React.FC<ValueCardProps> = ({ item, variants }) => {
  return (
    <motion.div
      className="group relative flex flex-col items-center p-6 overflow-hidden bg-[#2c2c2c] border-2 border-[#b58900] transition-all duration-300 ease-in-out min-h-[256px] max-w-[320px] after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-[40px] after:h-[40px] after:bg-[linear-gradient(135deg,transparent_50%,#b58900_50%)] after:opacity-20 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_rgba(181,137,0,0.2)] hover:bg-[#333333]"
      variants={variants}
    >
      <div className="p-3 mb-4 bg-[#3a3a3a] border-2 border-[#b58900] [image-rendering:pixelated] transition-transform duration-200 ease-in-out group-hover:scale-110 group-hover:border-[#fff3c4]">
        <Image
          src={item.iconSrc}
          alt={item.iconAlt}
          width={40}
          height={40}
          className="[image-rendering:pixelated] filter sepia-[100%] saturate-[300%] brightness-[70%] hue-rotate-[350deg]"
        />
      </div>
      <div className="flex flex-col items-center flex-grow text-center">
        <h3 className="mb-4 text-lg font-bold text-[#fff3c4] font-['Press_Start_2P']">
          {item.title}
        </h3>
        <p className="px-2 text-sm text-[#d3ba55] leading-6 font-['Press_Start_2P']">
          {item.description}
        </p>
      </div>
    </motion.div>
  )
}
