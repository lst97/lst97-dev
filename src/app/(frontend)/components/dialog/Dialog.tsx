import React, { useEffect } from 'react'
import { motion } from 'framer-motion'

interface DialogProps {
  children: React.ReactNode
  onClose: () => void
}

export const Dialog: React.FC<DialogProps> = ({ children, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-[1000] backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        className="bg-card-background border-4 border-border [box-shadow:8px_8px_0_var(--shadow-color)] p-6 md:p-8 max-w-[90%] w-[600px] max-h-[90vh] overflow-y-auto relative outline-2 outline-border-color outline-offset-4"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <button
          className="absolute top-4 right-4 w-8 h-8 border-2 border-border bg-card-background text-text-color text-2xl flex items-center justify-center cursor-pointer transition [box-shadow:2px_2px_0_var(--shadow-color)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:[box-shadow:3px_3px_0_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:[box-shadow:1px_1px_0_var(--shadow-color)]"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ×
        </button>
        {children}
      </motion.div>
    </div>
  )
}
