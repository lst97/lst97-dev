'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

const RecognitionSidebar: React.FC = () => (
  <motion.div
    className="bg-gray-800 border-r-0 border-b-2 lg:border-r-2 lg:border-b-0 border-amber-500 p-4 relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(45deg,#b58900_25%,transparent_25%),linear-gradient(-45deg,#b58900_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#b58900_75%),linear-gradient(-45deg,transparent_75%,#b58900_75%)] before:bg-[size:16px_16px] before:bg-[position:0_0,0_8px,8px_-8px,-8px_0px] before:opacity-[0.03] before:pointer-events-none"
    variants={itemVariants}
  >
    <div className="flex flex-col items-center gap-4 pb-4 border-b-2 border-amber-500">
      <Image
        src="/me-pixel-art.png"
        alt="Profile"
        width={80}
        height={80}
        className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-amber-500 p-0.5 bg-gray-700 rendering-pixelated"
      />
      <h3 className="text-amber-100 text-xs text-center text-shadow shadow-amber-500/30">
        Nelson Lai
      </h3>
      <p className="text-amber-300 text-xs sm:text-sm text-center">Junior Full Stack Developer</p>
    </div>
    <div className="mt-4">
      <motion.div
        className="bg-gray-700 border-2 border-amber-500 mb-2 transition-all duration-200 relative overflow-hidden after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(45deg,rgba(181,137,0,0.1)_25%,transparent_25%),linear-gradient(-45deg,rgba(181,137,0,0.1)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,rgba(181,137,0,0.1)_75%),linear-gradient(-45deg,transparent_75%,rgba(181,137,0,0.1)_75%)] after:bg-[size:8px_8px] after:bg-[position:0_0,0_4px,4px_-4px,-4px_0px] after:pointer-events-none last:mb-0 flex flex-row lg:flex-col items-center lg:items-start"
        variants={itemVariants}
      >
        <div className="bg-gray-700 border-2 border-amber-500 rendering-pixelated">
          <Image
            src="/pixel-art-award.svg"
            alt="Award"
            width={16}
            height={16}
            className="w-4 h-4 rendering-pixelated filter sepia-100 saturate-300 brightness-70 hue-rotate-[350deg]"
          />
        </div>
        <div className="text-amber-100 text-shadow shadow-amber-500/30 font-['Press_Start_2P'] text-sm xs:text-xs px-2 lg:px-4 py-2">
          Graduated with Distinction
        </div>
      </motion.div>
    </div>
  </motion.div>
)

export default RecognitionSidebar
