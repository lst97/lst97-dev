import React from 'react'
import { motion } from 'framer-motion'

interface NewSectionNavProps {
  sections: { id: string; label: string }[]
  activeSection: number
  onSectionClick: (index: number) => void
}

const SectionNav: React.FC<NewSectionNavProps> = ({ sections, activeSection, onSectionClick }) => {
  if (!sections || sections.length === 0) {
    return null
  }

  const containerHeight = sections.length * 135 + 16 // 135px per item + 16px padding
  const BUTTON_HEIGHT = 125
  const BUTTON_GAP = 8
  const PADDING = 16

  return (
    <motion.div
      className="hidden lg:block  bg-[#fff7e0] border-4 border-[#2c2c2c] p-4 rounded-lg shadow-[4px_4px_0_#2c2c2c76] relative overflow-hidden"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        width: '80px', // Fixed width
        height: `${containerHeight}px`, // Fixed height based on number of sections
        imageRendering: 'pixelated',
      }}
    >
      {/* Pattern overlay */}
      <div
        className="absolute inset-0 rounded opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(45deg, transparent 45%, #2c2c2c 45%, #2c2c2c 55%, transparent 55%)',
          backgroundSize: '6px 6px',
        }}
      />

      {/* Background indicators */}
      {sections.map(
        (section, index) =>
          activeSection === index && (
            <motion.div
              key={`bg-${section.id}`}
              className="absolute bg-[#ffe580] pointer-events-none z-[1]"
              layoutId="activeIndicator"
              style={{
                top: PADDING + index * (BUTTON_HEIGHT + BUTTON_GAP) + 3, // +3 for slight offset
                left: PADDING + 3,
                width: `calc(100% - ${PADDING * 2 + 6}px)`,
                height: BUTTON_HEIGHT - 6, // -6 to avoid covering borders (3px on each side)
                borderRadius: '2px',
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            />
          ),
      )}

      <div className="flex flex-col gap-3 w-full relative z-[2]">
        {sections.map((section, index) => (
          <motion.button
            key={section.id}
            onClick={() => onSectionClick(index)}
            className={`
              relative p-2 border-2 rounded text-center w-full
              font-['Press_Start_2P'] text-xs uppercase font-bold
              [writing-mode:vertical-rl] rotate-180 
              h-[120px] flex items-center justify-center
              transition-colors duration-200 pixel-scanlines
              bg-transparent
              ${
                activeSection === index
                  ? 'text-[#2c2c2c] border-[#2c2c2c] shadow-[2px_2px_0_#2c2c2c]'
                  : 'text-[#2c2c2c] border-transparent hover:border-[#2c2c2c] hover:shadow-[2px_2px_0_#2c2c2c]'
              }
            `}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
            whileTap={{
              scale: 0.95,
              transition: { duration: 0.1 },
            }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
            }}
            layout={false} // Disable layout animations which could affect width
          >
            <span className="relative z-[3]">{section.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export default SectionNav
