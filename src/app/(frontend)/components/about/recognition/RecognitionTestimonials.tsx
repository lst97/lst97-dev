'use client'

import React from 'react'
import Testimonial, { TestimonialProps } from './Testimonial'

interface RecognitionTestimonialsProps {
  testimonials: Omit<TestimonialProps, 'isTyped' | 'inView' | 'delay' | 'onTypingComplete'>[]
  typedMessages: boolean[]
  currentTypingIndex: number
  inView: boolean
  handleTypingComplete: (index: number) => void
}

const RecognitionTestimonials: React.FC<RecognitionTestimonialsProps> = ({
  testimonials,
  typedMessages,
  currentTypingIndex,
  inView,
  handleTypingComplete,
}) => (
  <div className="p-3 sm:p-6 h-[600px] sm:h-[700px] lg:h-[800px] overflow-y-auto flex flex-col gap-4 sm:gap-8 relative bg-gray-700 before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-48 before:h-48 sm:before:w-64 sm:before:h-64 lg:before:w-80 lg:before:h-80 before:bg-[url('/pixel-art-pig.svg')] before:bg-no-repeat before:bg-center before:bg-contain before:opacity-5 before:pointer-events-none before:rendering-pixelated before:filter before:sepia-100 before:saturate-300 before:brightness-70 before:hue-rotate-[350deg] scrollbar-thin scrollbar-thumb-amber-500 scrollbar-track-gray-800 scrollbar-thumb-rounded">
    {testimonials.map((testimonial, index) => {
      if (typedMessages[index]) {
        return (
          <Testimonial
            key={index}
            {...testimonial}
            isTyped={true}
            inView={true}
            delay={0}
            onTypingComplete={() => {}}
          />
        )
      }
      if (currentTypingIndex === index && inView) {
        return (
          <Testimonial
            key={index}
            {...testimonial}
            isTyped={false}
            inView={true}
            delay={500}
            onTypingComplete={() => handleTypingComplete(index)}
          />
        )
      }
      return (
        <Testimonial
          key={index}
          {...testimonial}
          isTyped={false}
          inView={false}
          delay={0}
          onTypingComplete={() => {}}
        />
      )
    })}
  </div>
)

export default RecognitionTestimonials
