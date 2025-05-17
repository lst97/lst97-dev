'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { FaFileAlt, FaFileCode, FaLock, FaRocket } from 'react-icons/fa'
import PixelArtAnimation from '@/frontend/components/animation/PixelArtAnimation'
import { LoadingSpinner, PageLoading } from '@/frontend/components/common/loading/Loading'
import dynamic from 'next/dynamic'
import { routes } from '@/frontend/constants/routes'
import Footer from '@/frontend/components/footer/Footer'

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
      aria-disabled={isComingSoon}
    >
      <div className="flex flex-col items-center text-center h-full">
        <div className="text-4xl text-accent-color mb-4">{icon}</div>
        <h3 className="font-['Press_Start_2P'] text-base mb-4">{title}</h3>
        <p className="font-['Press_Start_2P'] text-xs">{description}</p>
      </div>
    </Link>
  </div>
)

// Feature Card Component
const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <div className="bg-card border-2 border-border p-4 shadow-[4px_4px_0px_#000]">
    <div className="flex items-center mb-3">
      <div className="text-2xl text-accent-color mr-3">{icon}</div>
      <h3 className="font-['Press_Start_2P'] text-sm">{title}</h3>
    </div>
    <p className="font-['Press_Start_2P'] text-xs">{description}</p>
  </div>
)

// Content component
const FileToolsContent = () => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  // List of file tools
  const fileTools = [
    {
      icon: <FaFileAlt />,
      title: 'File Type Detection',
      description: 'Detect file types using AI without uploading them to a server',
      link: `${routes.tools}/file/type-detection`,
      isComingSoon: false,
    },
    {
      icon: <FaFileCode />,
      title: 'File Format Converter',
      description: 'Convert files between different formats without uploading them',
      link: `${routes.tools}/file/format-converter`,
      isComingSoon: true,
    },
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
        <main className="relative flex-grow w-full max-w-[1800px] mx-auto py-4 sm:py-6 md:py-8 mt-[100px] sm:mt-[120px] md:mt-[140px] lg:mt-[180px] bg-transparent">
          {/* Hero Section */}
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <Link
                href={routes.tools}
                className="bg-card font-['Press_Start_2P'] text-sm border-2 border-border px-3 py-2 shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                aria-label="Back to all tools"
              >
                ← Back to Tools
              </Link>
              <h1 className="text-4xl font-['Press_Start_2P'] text-text-color">File Tools</h1>
            </div>
            <p className="text-lg text-text-color max-w-3xl font-['Press_Start_2P'] mb-4">
              Free browser-based file tools that run locally on your device.
            </p>
            <p className="text-lg text-text-color max-w-3xl font-['Press_Start_2P']">
              Your files never leave your device - everything is processed right in your browser.
            </p>
          </section>

          {/* Tools Grid Section */}
          <section className="mb-16" aria-labelledby="available-tools">
            <h2 id="available-tools" className="text-3xl font-['Press_Start_2P'] mb-8 text-center">
              Available File Tools
            </h2>
            <div className="w-full flex justify-center items-center mb-8">
              <motion.div initial="initial" animate="animate" variants={floatingAnimation}>
                <Image
                  src="/touch-pixel-art.svg"
                  alt="File Tools Pixel Art"
                  width={128}
                  height={128}
                  className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-[filter] duration-300 will-change-transform hover:drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)]"
                />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {fileTools.map((tool, index) => (
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

          {/* Features Section */}
          <section className="mb-16" aria-labelledby="features">
            <h2 id="features" className="text-3xl font-['Press_Start_2P'] mb-8 text-center">
              Why Use Our File Tools?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <FeatureCard
                icon={<FaLock />}
                title="100% Private"
                description="All processing happens in your browser. Your files never leave your device or get uploaded to any server."
              />
              <FeatureCard
                icon={<FaRocket />}
                title="Fast Processing"
                description="Our tools use modern browser technologies to process your files quickly and efficiently."
              />
              <FeatureCard
                icon={<FaFileAlt />}
                title="Multiple Formats"
                description="Support for a wide range of file types and formats with our advanced detection algorithms."
              />
              <FeatureCard
                icon={<FaFileCode />}
                title="Completely Free"
                description="All tools are free to use with no hidden costs, subscriptions, or limitations."
              />
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16" aria-labelledby="faq">
            <h2 id="faq" className="text-3xl font-['Press_Start_2P'] mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-card border-2 border-border p-4 shadow-[4px_4px_0px_#000]">
                <h3 className="font-['Press_Start_2P'] text-base mb-2">
                  How do these tools work without uploading my files?
                </h3>
                <p className="font-['Press_Start_2P'] text-xs">
                  Our tools use your browser&apos;s built-in capabilities to process files locally.
                  The files are loaded and processed entirely on your device, ensuring your privacy.
                </p>
              </div>
              <div className="bg-card border-2 border-border p-4 shadow-[4px_4px_0px_#000]">
                <h3 className="font-['Press_Start_2P'] text-base mb-2">
                  Are there any file size limits?
                </h3>
                <p className="font-['Press_Start_2P'] text-xs">
                  Since processing happens on your device, limits depend on your browser and device
                  capabilities. Most modern browsers can handle large files without issues.
                </p>
              </div>
              <div className="bg-card border-2 border-border p-4 shadow-[4px_4px_0px_#000]">
                <h3 className="font-['Press_Start_2P'] text-base mb-2">
                  Why might my browser slow down during processing?
                </h3>
                <p className="font-['Press_Start_2P'] text-xs">
                  File processing can be CPU-intensive. When processing multiple or large files,
                  your browser might temporarily slow down as it&apos;s using your device&apos;s
                  resources.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </motion.div>
  )
}

// Main client component
export default function FileTools() {
  return (
    <DynamicDashboard>
      <Suspense fallback={<PageLoading message="Loading file tools..." />}>
        <FileToolsContent />
        <Footer />
      </Suspense>
    </DynamicDashboard>
  )
}
