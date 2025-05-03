import React from 'react'
import { motion } from 'framer-motion'

interface Experience {
  title: string
  hours: string
  icon: string
}

interface OtherExperienceProps {
  inView?: boolean
}

const experiences: Experience[] = [
  {
    title: 'Kitchen Hand',
    hours: '200+ hours',
    icon: '🍳',
  },
  {
    title: 'Uber Driver',
    hours: '2000+ deliveries',
    icon: '🚗',
  },
  {
    title: 'Cabineter',
    hours: '50+ hours',
    icon: '🔨',
  },
  {
    title: 'Blood Donation',
    hours: '13+ times',
    icon: '🩸',
  },
]

const OtherExperience: React.FC<OtherExperienceProps> = ({ inView = false }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  }

  return (
    <motion.div
      className="md:p-12 pt-6 bg-[#fff7e0] border-4 border-solid border-[#2c2c2c] rounded-2xl shadow-[12px_12px_0_#2c2c2c76] relative overflow-hidden md:m-14 min-h-[50vh] cross-grid-pattern"
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={container}
    >
      <motion.h2
        className="font-['Press_Start_2P'] text-3xl text-[#2c2c2c] text-center mb-12 uppercase relative font-bold"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Other Experience
      </motion.h2>
      <div className="grid grid-cols-1 gap-12 p-8 max-w-[1400px] mx-auto lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 md:gap-8 md:p-4">
        {experiences.map((exp, index) => (
          <motion.div
            key={index}
            className="bg-[#fffbeb] border-4 border-solid border-[#2c2c2c] p-10 relative transition-all duration-300 cursor-pointer [image-rendering:pixelated] min-h-[300px] flex flex-col items-center justify-center hover:translate-y-[-8px] hover:shadow-[8px_8px_0_#2c2c2c76] pixel-corner-dots md:p-6"
            variants={item}
            whileHover={{
              scale: 1.05,
              y: -8,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="bg-[rgba(44,44,44,0.1)] w-24 h-24 mx-auto mb-8 flex items-center justify-center border-3 border-dotted border-[#2c2c2c] relative [image-rendering:pixelated] rounded-lg md:w-16 md:h-16"
              whileHover={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-[3.5rem] [filter:drop-shadow(3px_3px_0_rgba(0,0,0,0.2))] md:text-[2.5rem]">
                {exp.icon}
              </span>
            </motion.div>
            <div className="text-center flex-grow flex flex-col justify-center gap-6">
              <h3 className="font-['Press_Start_2P'] text-2xl text-[#2c2c2c] mb-4 font-bold md:text-2xl">
                {exp.title}
              </h3>
              <motion.p
                className="font-['Press_Start_2P'] text-2xl text-[#2c2c2c] opacity-90 bg-[rgba(44,44,44,0.1)] py-4 px-6 border-3 border-solid border-[#2c2c2c] inline-block rounded-md font-bold md:text-xl md:py-3 md:px-4"
                whileHover={{
                  scale: 1.1,
                  transition: { duration: 0.2 },
                }}
              >
                {exp.hours}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default OtherExperience
