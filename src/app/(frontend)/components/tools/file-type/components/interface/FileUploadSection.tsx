'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaFileUpload } from 'react-icons/fa'

type FileUploadSectionProps = {
  onFileUpload: (files: File[]) => void
  dragActive: boolean
  handleDrag: (e: React.DragEvent<HTMLDivElement>) => void
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void
  fileInputRef: React.RefObject<HTMLInputElement>
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  onFileUpload,
  dragActive,
  handleDrag,
  handleDrop,
  fileInputRef,
}) => {
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
      className="w-full mb-8"
    >
      <input
        type="file"
        multiple
        onChange={handleFileUpload}
        ref={fileInputRef}
        className="hidden"
        aria-label="Upload files"
        accept="*/*"
      />

      <div
        className={`w-full border-4 ${
          dragActive ? 'border-border bg-accent/10' : 'border-border'
        } border-dashed rounded-none p-8 transition-colors duration-200 cursor-pointer`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        role="button"
        tabIndex={0}
        aria-label="Drag and drop area"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="mb-4 p-4 rounded-none bg-card-background border-4 border-border shadow-[2px_2px_0px_#000]"
          >
            <FaFileUpload size={36} className="text-accent-color" />
          </motion.div>

          <h3 className="text-lg font-['Press_Start_2P'] mb-2">
            {dragActive ? 'Drop files here' : 'Drag & Drop Files'}
          </h3>

          <p className="text-sm mb-3 font-['Press_Start_2P']">
            or <span className="text-accent-color underline cursor-pointer">browse files</span>
          </p>

          <p className="text-xs font-['Press_Start_2P'] opacity-70">
            All types of files supported. Processing happens locally.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
