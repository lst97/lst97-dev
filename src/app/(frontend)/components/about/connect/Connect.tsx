import React, { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { PkmLink } from '@/frontend/components/ui/Links'
import { connects } from '@/frontend/constants/data/connect'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      when: 'beforeChildren',
    },
  },
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    scale: 1.05,
    y: -5,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 10,
    },
  },
}

const imageVariants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
    rotate: -10,
  },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 20,
    },
  },
}

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 20,
      duration: 0.6,
      delay: 0.2,
    },
  },
}

const Connect: React.FC = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: '-100px' })

  return (
    <div ref={ref} className="flex flex-col items-center justify-center">
      <motion.div
        variants={imageVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <Image src="/pixel-art-blog-hand-mouse-cursor.png" alt="Connect" width={512} height={512} />
      </motion.div>
      <motion.section
        className="relative mt-16 bg-[#3a3a3a] border-4 border-[#b58900] font-['Press_Start_2P'] shadow-[8px_8px_0_rgba(181,137,0,0.2)] after:content-[''] after:absolute after:inset-0 after:bg-[url('/pixel-art-email.svg')] after:bg-no-repeat after:bg-[95%_10%] after:bg-[length:256px_256px] after:opacity-5 after:pointer-events-none after:z-0"
        variants={sectionVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <h2 className="pt-8 text-2xl relative text-[#fff3c4] text-shadow-[3px_3px_0_rgba(181,137,0,0.3)] tracking-wider pb-4 font-['Press_Start_2P'] text-center after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-[100px] after:h-1 after:bg-[repeating-linear-gradient(to_right,#b58900_0,#b58900_4px,transparent_4px,transparent_8px)]">
          Let&apos;s Connect!
        </h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1000px] mx-auto p-10"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {connects.map((item, index) => (
            <motion.div
              key={index}
              className="relative bg-[#2c2c2c] border-2 border-[#b58900] overflow-hidden min-h-[200px] flex flex-col justify-between after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-[50px] after:h-[50px] after:bg-[linear-gradient(135deg,transparent_50%,#b58900_50%)] after:opacity-20 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_rgba(181,137,0,0.2)] hover:bg-[#333333]"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  className="bg-[#3a3a3a] border-2 border-[#b58900] image-pixelated group-hover:scale-110 group-hover:border-[#fff3c4]"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={48}
                    height={48}
                    className="image-pixelated filter-[sepia(100%)_saturate(300%)_brightness(70%)_hue-rotate(350deg)]"
                  />
                </motion.div>
                <h3 className="text-[#fff3c4] text-shadow-[2px_2px_0_rgba(181,137,0,0.3)] font-['Press_Start_2P'] text-xl">
                  {item.title}
                </h3>
              </div>
              <PkmLink
                href={item.link}
                className="block text-[#d3ba55] text-xs border-l-2 border-l-[#b58900] font-['Press_Start_2P'] no-underline relative pl-4 after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[2px] after:bg-[#b58900] after:transition-[width_0.2s_ease-in-out] hover:text-[#fff3c4] hover:border-l-[#fff3c4] hover:pl-6 hover:after:w-[calc(100%-1.5rem)]"
              >
                {item.text}
              </PkmLink>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </div>
  )
}

Connect.displayName = 'Connect'
export default Connect
