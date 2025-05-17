'use client'

import React, { Suspense, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { BackgroundRemover } from '@/frontend/components/tools/bg-remover'
import { LoadingSpinner, PageLoading } from '@/frontend/components/common/loading/Loading'
import { routes } from '@/frontend/constants/routes'
import { FaInfoCircle, FaCheckCircle, FaCog } from 'react-icons/fa'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Footer } from '@/frontend/components/footer'

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

// InfoBox Component
const InfoBox: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({
  title,
  children,
  icon,
}) => (
  <div className="bg-card border-2 border-border p-4 shadow-[4px_4px_0px_#000] mb-4">
    <div className="flex items-center mb-2">
      <div className="text-2xl text-accent-color mr-3">{icon}</div>
      <h3 className="font-['Press_Start_2P'] text-sm">{title}</h3>
    </div>
    <div className="font-['Press_Start_2P'] text-xs">{children}</div>
  </div>
)

const BackgroundRemoverContent = () => {
  const pathname = usePathname()

  // Add JSON-LD Schema for SEO
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.innerHTML = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Free Background Remover Tool',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description:
        'Remove backgrounds from images using AI. Browser-based with no file uploads for complete privacy.',
      url: `https://lst97.dev${pathname}`,
    })
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [pathname])

  return (
    <div className="relative w-full min-h-screen flex flex-col bg-transparent">
      {/* Background Image with Floating Animation */}
      <motion.div
        className="absolute inset-0 z-[-1] opacity-20"
        animate={{
          y: [0, -10, 0],
          x: [0, 5, 0],
        }}
        transition={{
          duration: 10,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'mirror',
        }}
      >
        <Image
          src="/bg-remover-bg.png"
          alt="Background Remover Decoration"
          quality={50}
          width={512}
          height={512}
          className="absolute top-0 right-40 w-[30vw] h-[30vw] max-w-[512px] max-h-[512px]"
        />
      </motion.div>

      <main className="relative flex-grow w-full max-w-[1800px] mx-auto py-4 sm:py-6 md:py-8 mt-[100px] sm:mt-[120px] md:mt-[140px] lg:mt-[180px] bg-transparent">
        {/* Navigation and Header */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Link
              href={`${routes.tools}/image`}
              className="bg-card font-['Press_Start_2P'] text-sm border-2 border-border px-3 py-2 shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              aria-label="Back to Image Tools"
            >
              ← Back to Image Tools
            </Link>
            <h1 className="text-4xl font-['Press_Start_2P'] text-text-color">Background Remover</h1>
          </div>
          <p className="text-lg text-text-color max-w-3xl font-['Press_Start_2P'] mb-4">
            Remove image backgrounds instantly using AI, right in your browser.
          </p>
          <p className="text-sm text-text-color max-w-3xl font-['Press_Start_2P'] mb-6">
            All processing happens locally - your images never leave your device.
          </p>

          {/* Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <InfoBox title="Private & Secure" icon={<FaCheckCircle />}>
              <p>
                Your images are processed entirely in your browser. No data is uploaded to our
                servers.
              </p>
            </InfoBox>

            <InfoBox title="AI-Powered" icon={<FaInfoCircle />}>
              <p>
                Uses BRIA AI&apos;s RMBG-1.4 (fp32) model for professional-grade background removal.
              </p>
            </InfoBox>

            <InfoBox title="Multi-Threaded" icon={<FaCog />}>
              <p>
                Processes images efficiently using Web Workers for preprocessing, segmentation, and
                postprocessing stages.
              </p>
            </InfoBox>
          </div>
        </section>

        {/* Background Remover Tool */}
        <BackgroundRemover />

        {/* Additional Information for SEO */}
        <section className="mt-12 mb-8" aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="text-2xl font-['Press_Start_2P'] mb-6">
            How This Tool Works
          </h2>
          <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_#000]">
            <p className="font-['Press_Start_2P'] text-xs mb-4">
              This background remover uses a multi-staged, multi-threaded approach for maximum
              efficiency:
            </p>
            <ol className="font-['Press_Start_2P'] text-xs space-y-3 list-decimal pl-5">
              <li>
                <strong>Preprocessing Stage:</strong> Images are optimized for the AI model using
                separate worker threads
              </li>
              <li>
                <strong>Segmentation Stage:</strong> The AI model runs in parallel workers to
                identify foreground elements
              </li>
              <li>
                <strong>Postprocessing Stage:</strong> Dedicated workers apply the segmentation mask
                to create transparent backgrounds
              </li>
              <li>
                All stages happen concurrently, creating a processing pipeline for multiple images
              </li>
            </ol>
            <p className="font-['Press_Start_2P'] text-xs mt-4">
              The tool uses WebGL acceleration and Web Workers to maximize browser performance while
              maintaining complete privacy as no data is transmitted over the internet.
            </p>
          </div>
        </section>

        {/* Common Use Cases for SEO */}
        <section className="mb-12" aria-labelledby="use-cases">
          <h2 id="use-cases" className="text-2xl font-['Press_Start_2P'] mb-6">
            Common Use Cases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border-2 border-border p-4 shadow-[4px_4px_0px_#000]">
              <h3 className="font-['Press_Start_2P'] text-sm mb-2">Product Photography</h3>
              <p className="font-['Press_Start_2P'] text-xs">
                Create clean, professional product images with transparent backgrounds for
                e-commerce, catalogs, or marketing materials.
              </p>
            </div>
            <div className="bg-card border-2 border-border p-4 shadow-[4px_4px_0px_#000]">
              <h3 className="font-['Press_Start_2P'] text-sm mb-2">Portrait Editing</h3>
              <p className="font-['Press_Start_2P'] text-xs">
                Remove backgrounds from portraits to create professional headshots or place subjects
                against new backgrounds.
              </p>
            </div>
            <div className="bg-card border-2 border-border p-4 shadow-[4px_4px_0px_#000]">
              <h3 className="font-['Press_Start_2P'] text-sm mb-2">Graphic Design</h3>
              <p className="font-['Press_Start_2P'] text-xs">
                Extract elements from images to incorporate into designs, collages, or compositions
                without manual masking.
              </p>
            </div>
            <div className="bg-card border-2 border-border p-4 shadow-[4px_4px_0px_#000]">
              <h3 className="font-['Press_Start_2P'] text-sm mb-2">Batch Processing</h3>
              <p className="font-['Press_Start_2P'] text-xs">
                Process multiple images at once with our efficient multi-threaded architecture for
                consistent results across an entire set of photos or product catalog.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="mb-12" aria-labelledby="tech-specs">
          <h2 id="tech-specs" className="text-2xl font-['Press_Start_2P'] mb-6">
            Technical Specifications
          </h2>
          <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_#000]">
            <p className="font-['Press_Start_2P'] text-xs mb-4">
              This tool leverages cutting-edge web technologies to deliver high-performance
              background removal:
            </p>
            <ul className="font-['Press_Start_2P'] text-xs space-y-3 list-disc pl-5">
              <li>
                <strong>AI Model:</strong> BRIA AI&apos;s RMBG-1.4 running via transformers.js in
                the browser
              </li>
              <li>
                <strong>Performance:</strong> Up to 8 parallel Web Workers (2 preprocessing, 4
                segmentation, 2 postprocessing)
              </li>
              <li>
                <strong>Input Format:</strong> Supports JPG, PNG, GIF and most common image formats
              </li>
              <li>
                <strong>Output Format:</strong> Transparent PNG with preserved image quality
              </li>
              <li>
                <strong>Processing:</strong> 100% client-side with no server uploads, maintaining
                complete privacy
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}

export default function ImageBackgroundRemoverPage() {
  return (
    <DynamicDashboard>
      <Suspense fallback={<PageLoading message="Loading background remover..." />}>
        <BackgroundRemoverContent />
      </Suspense>
      <Footer />
    </DynamicDashboard>
  )
}
