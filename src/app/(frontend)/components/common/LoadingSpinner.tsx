import React from 'react'
import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  message?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 image-rendering-pixelated">
      <motion.div
        className="relative w-15 h-15 origin-bottom"
        animate={{
          rotate: [0, -25, 25, -20, 20, -15, 15, -10, 10, 0, 0],
        }}
        transition={{
          duration: 1.5,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'loop',
        }}
      >
        <div className="absolute top-0 w-full h-1/2 bg-red-600 rounded-t-full border-4 border-black border-b-2" />
        <div className="absolute bottom-0 w-full h-1/2 bg-gray-200 rounded-b-full border-4 border-black border-t-2" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-gray-200 border-4 border-black rounded-full z-10">
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            animate={{
              backgroundColor: ['#fff', '#fff', '#ff1f1f', '#ff1f1f', '#fff', '#fff'],
              boxShadow: ['none', 'none', '0 0 20px #ff1f1f', '0 0 20px #ff1f1f', 'none', 'none'],
            }}
            transition={{
              duration: 1.5,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'loop',
              times: [0, 0.1, 0.2, 0.8, 0.9, 1],
            }}
          />
        </div>
      </motion.div>
      <p className="mt-4 font-['Press_Start_2P'] text-base text-gray-700 text-center">{message}</p>
    </div>
  )
}
