'use client'

import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { FaFileUpload } from 'react-icons/fa'

type UploadSectionProps = {
  onFileUpload: (files: File[]) => void
  dragActive: boolean
  handleDrag: (e: React.DragEvent<HTMLDivElement>) => void
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onFileUpload,
  dragActive,
  handleDrag,
  handleDrop,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      onFileUpload(Array.from(files))
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div
        onClick={triggerFileInput}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`p-8 border-4 border-dashed rounded-lg cursor-pointer text-center transition-all ${
          dragActive ? 'bg-accent/20' : 'border-border hover:border-accent hover:bg-accent/10'
        }`}
      >
        <FaFileUpload className="mx-auto text-4xl mb-4 text-accent-color" />
        <p className="mb-2 font-bold text-lg font-['Press_Start_2P']">
          Drop your images here or click to upload
        </p>
        <p className="text-sm opacity-70 font-['Press_Start_2P']">
          Supports JPG, PNG, GIF, WEBP, HEIC • Multiple files allowed
        </p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          multiple
          className="hidden"
        />
      </div>
    </motion.div>
  )
}
