'use client'

import React from 'react'
import Image from 'next/image'

import PixelArtAnimation from '@/frontend/components/animation/PixelArtAnimation'
import { Dashboard } from '@/frontend/components/main/Dashboard'
import { HeroSection, CommentsSection } from '@/frontend/components/guest-book/sections'
import { Footer } from '@/frontend/components/footer/Footer'
import { GuestBookForm } from '@/frontend/components/guest-book/forms/GuestBookForm'

export default function GuestBookClient() {
  const titleText = 'Digital Guest Book - Leave Your Mark'

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

          {/* Floating Guest Book Image */}
          <div className="w-full flex justify-center items-center mb-16 min-h-screen relative">
            <div
              className="initial animate"
              style={{
                transform: 'translateY(-10px)',
                animation: 'float 4s ease-in-out infinite',
              }}
            >
              <Image
                src="/guest-book-pixel-art.png"
                alt="Guest Book Pixel Art"
                width={768}
                height={768}
                className="flex justify-center items-center drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-[filter] duration-300 will-change-transform hover:drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)]"
              />
            </div>
          </div>

          <CommentsSection />

          {/* Floating Form Image */}
          <div className="w-full flex justify-center items-center mb-16 min-h-[300px] relative">
            <div
              className="initial animate"
              style={{
                transform: 'translateY(-10px)',
                animation: 'float 4s ease-in-out infinite',
              }}
            >
              <Image
                src="/chat-bubble-pixel-art.png"
                alt="Form Pixel Art"
                width={512}
                height={512}
                className="flex justify-center items-center drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-[filter] duration-300 will-change-transform hover:drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)]"
              />
            </div>
          </div>

          {/* Guest Book Form Section */}
          <section className="mb-16" id="sign-guest-book">
            <h2 className="leading-16 font-['Press_Start_2P'] text-[3rem] text-text-color drop-shadow-[3px_3px_0_var(--text-shadow-color)] mb-12 text-center relative after:content-[''] after:absolute after:bottom-[-1rem] after:left-1/2 after:-translate-x-1/2 after:w-[100px] after:h-1 after:bg-[repeating-linear-gradient(45deg,var(--border-color)_0,var(--border-color)_4px,transparent_4px,transparent_8px)]">
              Sign the Guest Book
            </h2>

            <div className="max-w-6xl mx-auto">
              <div className="mb-8 text-center">
                <p className="font-pixel text-lg text-text-color leading-relaxed max-w-4xl mx-auto">
                  I&apos;d love to hear from you! Share your thoughts, feedback, or just say hello.
                  Your message will be part of this site&apos;s story.
                </p>
              </div>

              <div className="max-w-4xl mx-auto mb-16 bg-card p-12 shadow-[8px_8px_0_var(--shadow-color)] border-6 border-border">
                <GuestBookForm
                  onSubmit={async (_data) => {
                    // Optional callback - React Query handles the actual submission
                    console.log('Guest book entry submitted successfully!')
                  }}
                />
              </div>
            </div>
          </section>
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
