import React from 'react'
import { motion } from 'framer-motion'

interface MessageProps {
  type: 'success' | 'error'
  message: string
}

const Message: React.FC<MessageProps> = ({ type, message }) => {
  return (
    <motion.div
      className={`p-8 mb-12 shadow-[8px_8px_0_var(--shadow-color)] font-['Press_Start_2P',_monospace] text-[1.8rem] leading-[1.8] text-center relative transition-all duration-300 ease-in-out text-[var(--text-color)] md:text-[1.4rem] md:p-6 ${type === 'success' ? 'border-4 border-[#7cc57f] bg-[#97eb9a]' : 'border-4 border-[#e77e74] bg-[#ffc9c0]'}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {message}
    </motion.div>
  )
}

export default Message
