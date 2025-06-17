'use client'

import React from 'react'
import Image from 'next/image'
import { FaStar, FaCalendarAlt, FaPercentage } from 'react-icons/fa'
import { MdDeliveryDining } from 'react-icons/md'

import PixelArtAnimation from '@/frontend/components/animation/PixelArtAnimation'
import { Dashboard } from '@/frontend/components/main/Dashboard'
import {
  HeroSection,
  StatsSection,
  GearSection,
  CommentsSection,
  CTASection,
  LiveCameraSection,
} from '@/frontend/components/uber/sections'
import { Footer } from '@/frontend/components/footer/Footer'
import { UberCommentForm } from '@/frontend/components/uber/forms/UberCommentForm'

// This data is now fetched from PayloadCMS via API

// Stats data
const statsData = [
  {
    icon: <MdDeliveryDining className="text-accent-color text-4xl" />,
    number: '2000+',
    label: 'Deliveries Completed',
    description: 'Successfully delivered over 2000 orders with care and precision',
  },
  {
    icon: <FaCalendarAlt className="text-accent-color text-4xl" />,
    number: '1+',
    label: 'Years Experience',
    description: 'Over a year of dedicated delivery service experience',
  },
  {
    icon: <FaStar className="text-accent-color text-4xl" />,
    number: '98%',
    label: 'Customer Rating',
    description: 'Maintaining an exceptional 98% customer satisfaction rate',
  },
  {
    icon: <FaPercentage className="text-accent-color text-4xl" />,
    number: '0%',
    label: 'Cancellation Rate',
    description: 'Zero cancellations - committed to every delivery',
  },
]

// Gear data
const gearData = [
  {
    id: 1,
    name: 'Insulated Heat Bag',
    description:
      'Insulated bag that keeps food at optimal temperature throughout delivery. Multiple compartments for different food types.',
    image: '/gear/heat-bag.jpg', // You'll need to add this image
    features: [
      'Temperature retention',
      'Multiple compartments',
      'Easy to clean',
      'Professional grade',
    ],
  },
  {
    id: 2,
    name: 'Drink & Soup Carrier',
    description:
      'Secure mounting system with bucket design to prevent spills and ensure drinks and soups arrive safely.',
    image: '/gear/drink-carrier.jpg', // You'll need to add this image
    features: [
      'Spill-proof design',
      'Secure mounting',
      'Multiple cup holders',
      'Soup container support',
    ],
  },
  {
    id: 3,
    name: 'Vehicle Mount System',
    description:
      'Professional mounting system that keeps all delivery items secure during transport, preventing movement and potential damage.',
    image: '/gear/mount-system.jpg', // You'll need to add this image
    features: ['Vibration dampening', 'Secure fastening', 'Easy access', 'Universal compatibility'],
  },
]

export default function UberClient() {
  const titleText = 'Professional Uber Delivery Driver - Treating Every Order with Care'

  return (
    <Dashboard>
      <div className="fixed inset-0 w-full h-screen">
        <PixelArtAnimation
          opacity={0.3}
          sizeRange={[50, 100]}
          numSquares={20}
          interactionDistance={200}
          colors={['#ffe580']}
          className="w-full h-screen"
        />
      </div>

      <div className="relative w-full min-h-screen flex flex-col bg-transparent">
        <main className="relative flex-grow w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 py-4 sm:py-6 md:py-8 mt-[100px] sm:mt-[120px] md:mt-[140px] lg:mt-[180px] bg-transparent">
          <HeroSection titleText={titleText} />

          {/* Floating Car Image */}
          <div className="w-full flex justify-center items-center mb-16 min-h-screen relative">
            <div
              className="initial animate"
              style={{
                transform: 'translateY(-10px)',
                animation: 'float 4s ease-in-out infinite',
              }}
            >
              <Image
                src="/car-pixel-art.png"
                alt="Delivery Car Pixel Art"
                width={768}
                height={768}
                className="flex justify-center items-center drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-[filter] duration-300 will-change-transform hover:drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)]"
              />
            </div>
          </div>

          <LiveCameraSection />

          <StatsSection stats={statsData} />

          {/* Floating Delivery Bag Image */}
          <div className="w-full flex justify-center items-center mb-16 min-h-[300px] relative">
            <div
              className="initial animate"
              style={{
                transform: 'translateY(-10px)',
                animation: 'float 4s ease-in-out infinite',
              }}
            >
              <Image
                src="/briefcase-pixel-art.svg"
                alt="Delivery Bag Pixel Art"
                width={1024}
                height={1024}
                className="flex justify-center items-center drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-[filter] duration-300 will-change-transform hover:drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)]"
              />
            </div>
          </div>

          <GearSection gear={gearData} />

          {/* Floating Comments Image */}
          <div className="w-full flex justify-center items-center mb-16 min-h-[300px] relative">
            <div
              className="initial animate"
              style={{
                transform: 'translateY(-10px)',
                animation: 'float 4s ease-in-out infinite',
              }}
            >
              <Image
                src="/chat-pixel-art-icon.svg"
                alt="Comments Pixel Art"
                width={768}
                height={768}
                className="flex justify-center items-center drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-[filter] duration-300 will-change-transform hover:drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)]"
              />
            </div>
          </div>

          <CommentsSection />

          <div className="max-w-4xl mx-auto mb-16 bg-card p-12 shadow-[8px_8px_0_var(--shadow-color)] border-6 border-border">
            <UberCommentForm
              onSubmit={async (_data) => {
                // Optional callback - React Query handles the actual submission
                console.log('Comment submitted successfully!')
              }}
            />
          </div>

          <CTASection />
        </main>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(-10px);
          }
          50% {
            transform: translateY(10px);
          }
        }
      `}</style>
    </Dashboard>
  )
}
