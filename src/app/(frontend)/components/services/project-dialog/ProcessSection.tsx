import React from 'react'
import { motion } from 'framer-motion'
import { ProjectProcessStep } from '../types'

interface ProcessSectionProps {
  process: ProjectProcessStep[]
}

const cardVariants = {
  initial: { scale: 0.95, opacity: 0, y: 30 },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 24 },
  },
  hover: {
    scale: 1.03,
    boxShadow: '8px 8px 0 0 #b58900, 0 0 0 0px #2c2c2c',
    transition: { type: 'spring', stiffness: 400, damping: 18 },
  },
}

// Timeline node (icon in large circle, only for desktop)
const TimelineNode: React.FC<{ icon: string }> = ({ icon }) => (
  <div className="hidden md:flex flex-col items-center w-32">
    <div className="font-['Press_Start_2P'] w-20 h-20 bg-[#fffbeb] border-4 border-[#2c2c2c] shadow-[4px_4px_0_0_#b58900] rounded-full flex items-center justify-center relative text-4xl">
      {icon}
    </div>
  </div>
)

// Description card with number badge
const ProcessStepCard: React.FC<{
  step: ProjectProcessStep
  index: number
  isLeft: boolean
  showIconInCard?: boolean
}> = ({ step, index, isLeft, showIconInCard }) => (
  <motion.div
    className="bg-[#fffbe9] border-4 border-[#2c2c2c] rounded-[10px] relative min-w-[240px] md:min-w-[340px] w-full max-w-md text-left flex items-center gap-4 shadow-[8px_8px_0_0_#b58900] pixel-border px-6 md:px-10 py-8"
    variants={cardVariants}
    initial="initial"
    whileInView="animate"
    whileHover="hover"
    viewport={{ once: true, amount: 0.6 }}
    style={{
      marginRight: isLeft ? '-12px' : undefined,
      marginLeft: !isLeft ? '-12px' : undefined,
      fontFamily: 'Press Start 2P, monospace',
      backgroundImage:
        'repeating-linear-gradient(135deg, #fffbe9 0px, #fffbe9 12px, #fdf3c9 12px, #fdf3c9 24px)',
    }}
  >
    {/* Number badge, top right for left card, top left for right card (desktop), always top left on mobile */}
    <span
      className={`font-['Press_Start_2P'] min-w-10 justify-center absolute -top-5 left-4 z-20 bg-[#fdf3c9] border-4 border-primary rounded-md px-4 py-2 text-primary  text-lg font-bold flex items-center shadow-[4px_4px_0_0_#b58900] pixel-border md:${isLeft ? 'right-4 left-auto' : 'left-4 right-auto'}`}
      style={{ boxShadow: '4px 4px 0 0 #b58900' }}
    >
      {index + 1}
    </span>
    {/* Icon in card for mobile only */}
    {showIconInCard && (
      <span className="font-['Press_Start_2P'] text-2xl mr-3 md:hidden">{step.icon}</span>
    )}
    <div>
      <div className="text-md text-primary  font-bold mb-2 font-['Press_Start_2P']">
        {step.title}
      </div>
      <div className="font-['Press_Start_2P'] text-xs text-[#2c2c2c] leading-snug">
        {step.description}
      </div>
    </div>
  </motion.div>
)

export const ProcessSection: React.FC<ProcessSectionProps> = ({ process }) => (
  <div className="font-['Press_Start_2P'] p-4 md:p-8 flex flex-col gap-12">
    <h3 className="text-3xl text-primary  mb-2 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] text-center  border-dashed  pb-2">
      DEVELOPMENT PROCESS
    </h3>

    <div
      className="relative flex flex-col items-center"
      style={{ minHeight: process.length * 140 + 60 }}
    >
      {/* Central vertical timeline (desktop only) */}
      <div
        className="hidden md:block absolute left-1/2 top-0 bottom-0 w-4 bg-primary border-x-4 border-dashed border-[#2c2c2c] z-0"
        style={{ transform: 'translateX(-50%)' }}
      ></div>
      {process.map((step, index) => (
        <div
          key={index}
          className={`w-full flex items-center justify-between mb-10 md:mb-16 relative ${index % 2 === 0 ? '' : ''}`}
          style={{ minHeight: 140 }}
        >
          {/* Left card (desktop) or full width (mobile) */}
          {index % 2 === 0 ? (
            <div className="w-full md:w-[48%] flex justify-end md:pr-2">
              <ProcessStepCard step={step} index={index} isLeft={true} showIconInCard={true} />
            </div>
          ) : (
            <div className="hidden md:block w-[48%]" />
          )}

          {/* Timeline node (icon in large circle, desktop only) */}
          <TimelineNode icon={step.icon} />

          {/* Right card (desktop) or nothing (mobile) */}
          {index % 2 === 1 ? (
            <div className="w-full md:w-[48%] flex justify-start md:pl-2">
              <ProcessStepCard step={step} index={index} isLeft={false} showIconInCard={true} />
            </div>
          ) : (
            <div className="hidden md:block w-[48%]" />
          )}
        </div>
      ))}
    </div>
  </div>
)
