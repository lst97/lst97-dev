'use client'

import React, { Suspense, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ImageConverter } from '@/frontend/components/tools/image-converter/ImageConverter'
import { LoadingSpinner, PageLoading } from '@/frontend/components/common/loading/Loading'
import { routes } from '@/frontend/constants/routes'
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'

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

const ImageConverterContent = () => {
  const pathname = usePathname()

  // Add JSON-LD Schema for SEO
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.innerHTML = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Free Image Converter Tool',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description:
        'Convert images between JPG, PNG, WebP, and other formats for free. Browser-based with no file uploads.',
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
          src="/image-converter-bg.png"
          alt="Image Converter Background Decoration"
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
            <h1 className="text-4xl font-['Press_Start_2P'] text-text-color">Image Converter</h1>
          </div>
          <p className="text-lg text-text-color max-w-3xl font-['Press_Start_2P'] mb-4">
            Convert images between JPG, PNG, WebP, and other formats without uploading them.
          </p>
          <p className="text-sm text-text-color max-w-3xl font-['Press_Start_2P'] mb-6">
            All processing happens in your browser - your files never leave your device.
          </p>

          {/* Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <InfoBox title="Private & Secure" icon={<FaCheckCircle />}>
              <p>
                Your images are processed entirely in your browser. Nothing gets uploaded to our
                servers.
              </p>
            </InfoBox>

            <InfoBox title="Supported Formats" icon={<FaInfoCircle />}>
              <p>Convert between JPG, PNG, WebP, and GIF formats with quality control options.</p>
            </InfoBox>

            <InfoBox title="Tips for Best Results" icon={<FaExclamationTriangle />}>
              <p>Large images may cause your browser to slow down temporarily during processing.</p>
            </InfoBox>
          </div>
        </section>

        {/* Image Converter Tool */}
        <ImageConverter />

        {/* Additional Information for SEO */}
        <section className="mt-12 mb-8" aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="text-2xl font-['Press_Start_2P'] mb-6">
            How This Tool Works
          </h2>
          <div className="bg-card border-2 border-border p-6 shadow-[4px_4px_0px_#000]">
            <p className="font-['Press_Start_2P'] text-xs mb-4">
              This image converter uses your browser&apos;s built-in capabilities to convert images
              between different formats:
            </p>
            <ol className="font-['Press_Start_2P'] text-xs space-y-3 list-decimal pl-5">
              <li>When you upload an image, it&apos;s loaded into your browser&apos;s memory</li>
              <li>The image is decoded and processed using JavaScript and HTML5 Canvas</li>
              <li>The converted image is generated in your selected format</li>
              <li>You can download the result directly to your device</li>
            </ol>
            <p className="font-['Press_Start_2P'] text-xs mt-4">
              This process ensures your privacy since no data is transmitted over the internet. The
              tool works offline once the page is loaded.
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
              <h3 className="font-['Press_Start_2P'] text-sm mb-2">Convert JPG to WebP</h3>
              <p className="font-['Press_Start_2P'] text-xs">
                WebP offers better compression than JPG while maintaining quality. Convert your JPGs
                to WebP to reduce file size for websites.
              </p>
            </div>
            <div className="bg-card border-2 border-border p-4 shadow-[4px_4px_0px_#000]">
              <h3 className="font-['Press_Start_2P'] text-sm mb-2">Convert PNG to JPG</h3>
              <p className="font-['Press_Start_2P'] text-xs">
                Convert transparent PNGs to JPGs for applications that don&apos;t support
                transparency or to reduce file size.
              </p>
            </div>
            <div className="bg-card border-2 border-border p-4 shadow-[4px_4px_0px_#000]">
              <h3 className="font-['Press_Start_2P'] text-sm mb-2">Adjust Image Quality</h3>
              <p className="font-['Press_Start_2P'] text-xs">
                Fine-tune the quality settings when converting to JPG or WebP to balance between
                quality and file size.
              </p>
            </div>
            <div className="bg-card border-2 border-border p-4 shadow-[4px_4px_0px_#000]">
              <h3 className="font-['Press_Start_2P'] text-sm mb-2">
                Batch Convert Multiple Images
              </h3>
              <p className="font-['Press_Start_2P'] text-xs">
                Upload multiple images and convert them all at once, then download as individual
                files or as a ZIP archive.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default function ImageConverterPage() {
  return (
    <DynamicDashboard>
      <Suspense fallback={<PageLoading message="Loading image converter..." />}>
        <ImageConverterContent />
      </Suspense>
    </DynamicDashboard>
  )
}
