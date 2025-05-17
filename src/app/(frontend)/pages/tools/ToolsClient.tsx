'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import PixelArtAnimation from '@/frontend/components/animation/PixelArtAnimation'
import { LoadingSpinner, PageLoading } from '@/frontend/components/common/loading/Loading'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { FaImages, FaFileAlt } from 'react-icons/fa'
import { routes } from '../../constants/routes'

// Dynamically import the Dashboard component with SSR disabled
const DynamicDashboard = dynamic(
  () => import('@/frontend/components/main/Dashboard').then((mod) => mod.Dashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-screen">
        <LoadingSpinner />
        <div className="mt-4 font-['Press_Start_2P'] text-sm">Loading dashboard...</div>
      </div>
    ),
  },
)

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// Tool card type definition
type ToolCardProps = {
  icon: React.ReactNode
  title: string
  description: string
  link: string
  isComingSoon?: boolean
}

// Tool card component
const ToolCard: React.FC<ToolCardProps> = ({
  icon,
  title,
  description,
  link,
  isComingSoon = false,
}) => (
  <div className="relative">
    {isComingSoon && (
      <div className="bg-card absolute -top-2 -right-2 z-10 bg-accent-color px-2 py-1 border-2 border-border font-['Press_Start_2P'] text-xs transform rotate-3 shadow-[2px_2px_0px_#000]">
        Coming Soon
      </div>
    )}
    <Link
      href={isComingSoon ? '#' : link}
      className={`
        block h-full border-4 border-border rounded-none bg-card p-6 
        shadow-[8px_8px_0px_#000]
        hover:shadow-[4px_4px_0px_#000] hover:translate-x-[4px] hover:translate-y-[4px]
        transition-all duration-200
        ${isComingSoon ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={(e) => isComingSoon && e.preventDefault()}
    >
      <div className="flex flex-col items-center text-center h-full">
        <div className="text-4xl text-accent-color mb-4">{icon}</div>
        <h3 className="font-['Press_Start_2P'] text-base mb-4">{title}</h3>
        <p className="font-['Press_Start_2P'] text-xs">{description}</p>
      </div>
    </Link>
  </div>
)

// Content component
const ToolsContent = () => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const titleText = 'My Toolbox'

  // List of all tools
  const tools = [
    {
      icon: <FaImages />,
      title: 'Image',
      description:
        'A collection of image tools including converter, background remover, and more ...',
      link: `${routes.tools}/image`,
      isComingSoon: false,
    },
    {
      icon: <FaFileAlt />,
      title: 'File',
      description:
        'A collection of file tools including AI-powered file type detection and more ...',
      link: `${routes.tools}/file`,
      isComingSoon: false,
    },
    // {
    //   icon: <FaFileImage />,
    //   title: 'HEIC Converter',
    //   description: 'Convert HEIC images to more common formats',
    //   link: '/tools/image/heic-converter',
    //   isComingSoon: true,
    // },
    // {
    //   icon: <FaPalette />,
    //   title: 'Color Tools',
    //   description: 'Color palette generator, contrast checker, and more',
    //   link: '/tools/color',
    //   isComingSoon: true,
    // },
    // {
    //   icon: <FaCode />,
    //   title: 'Code Formatter',
    //   description: 'Format and beautify code in various languages',
    //   link: '/tools/code/formatter',
    //   isComingSoon: true,
    // },
    // {
    //   icon: <FaFileAlt />,
    //   title: 'PDF Tools',
    //   description: 'Merge, split, compress and convert PDF files',
    //   link: '/tools/pdf',
    //   isComingSoon: true,
    // },
    // {
    //   icon: <FaTools />,
    //   title: 'Developer Utils',
    //   description: 'JSON formatter, Base64 encoder/decoder, and more',
    //   link: '/tools/dev',
    //   isComingSoon: true,
    // },
  ]

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isLoading ? 0 : 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="fixed inset-0 w-full h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut', delay: 1 }}
        >
          <PixelArtAnimation
            opacity={0.3}
            sizeRange={[50, 100]}
            numSquares={20}
            interactionDistance={200}
            colors={['#ffe580']}
            className="w-full h-screen"
          />
        </motion.div>
      </div>
      <div className="relative w-full min-h-screen flex flex-col bg-transparent">
        <main className="relative flex-grow w-full max-w-[1800px] mx-auto px-2 md:px-8 py-4 sm:py-6 md:py-8 mt-[100px] sm:mt-[120px] md:mt-[140px] lg:mt-[180px] bg-transparent">
          {/* Hero Section */}
          <section className="mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-['Press_Start_2P'] text-text-color mb-6">
              {titleText.split(' ').map((word, index) => (
                <span key={index} className="inline-block">
                  {word}{' '}
                </span>
              ))}
            </h1>
            <p className="text-lg md:text-xl text-text-color max-w-3xl font-['Press_Start_2P'] mb-4">
              Simple tools should be free and easy to use. This collection primarily to make my life
              easier.
            </p>
            <p className="text-lg md:text-xl text-text-color max-w-3xl font-['Press_Start_2P']">
              Primarily run in your browser offering maximum speed, while respecting your privacy.
            </p>
          </section>

          {/* Tools Grid Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-['Press_Start_2P'] mb-8 text-center">Available Tools</h2>
            <div className="w-full flex justify-center items-center mb-8">
              <motion.div initial="initial" animate="animate" variants={floatingAnimation}>
                <Image
                  src="/screwdriver-pixel-art.svg"
                  alt="Tools Pixel Art"
                  width={128}
                  height={128}
                  className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-[filter] duration-300 will-change-transform hover:drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)]"
                />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {tools.map((tool, index) => (
                <ToolCard
                  key={index}
                  icon={tool.icon}
                  title={tool.title}
                  description={tool.description}
                  link={tool.link}
                  isComingSoon={tool.isComingSoon}
                />
              ))}
            </div>
          </section>

          {/* Future Tools Section */}
          <section className="mb-16 text-center">
            <h2 className="text-3xl font-['Press_Start_2P'] mb-6">More Tools Coming Soon</h2>
            <p className="font-['Press_Start_2P'] text-lg mb-8 max-w-3xl mx-auto">
              Have a suggestion for a useful tool? Let me know!
            </p>
            <div className="w-full flex justify-center items-center">
              <motion.div initial="initial" animate="animate" variants={floatingAnimation}>
                <Image
                  src="/touch-pixel-art.svg"
                  alt="More Tools Coming Soon"
                  width={128}
                  height={128}
                  className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-[filter] duration-300 will-change-transform hover:drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)]"
                />
              </motion.div>
            </div>
          </section>
        </main>
      </div>
    </motion.div>
  )
}

// Main client component
export default function ToolsClient() {
  return (
    <DynamicDashboard>
      <Suspense fallback={<PageLoading message="Loading tools..." />}>
        <ToolsContent />
      </Suspense>
    </DynamicDashboard>
  )
}
