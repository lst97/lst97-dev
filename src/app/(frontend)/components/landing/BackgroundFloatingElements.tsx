import { motion, Variants } from 'framer-motion'
import Image from 'next/image'
import { useReducedMotion } from 'framer-motion'
import { FloatingElementProps } from './types'

// Reusable component for floating elements
const FloatingElement = ({
  src,
  alt,
  width,
  height,
  className,
  imageClassName = '',
  floatDuration = 4,
  floatOffset = -15,
  hoverScale = 1.1,
}: FloatingElementProps) => {
  const prefersReducedMotion = useReducedMotion()

  const variants: Variants = {
    hover: {
      scale: hoverScale,
      transition: { duration: 0.3 },
    },
    animate: prefersReducedMotion
      ? {}
      : {
          y: [0, floatOffset, 0],
          transition: {
            duration: floatDuration,
            repeat: Infinity,
            repeatType: 'reverse' as const,
            ease: 'easeInOut',
          },
        },
  }

  return (
    <motion.div
      whileHover="hover"
      animate="animate"
      variants={variants}
      className={`absolute pointer-events-auto cursor-pointer ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`object-contain opacity-60 grayscale-20 brightness-110 z-20 mix-blend-multiply ${imageClassName}`}
        priority
      />
    </motion.div>
  )
}

const BackgroundFloatingElements = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
      {/* Pig */}
      <FloatingElement
        src="/pig-pixel-art.png"
        alt="Pig"
        width={300}
        height={300}
        className="right-[8%] bottom-[28%] w-[300px] h-[300px] hidden sm:block"
        imageClassName="w-full h-full scale-x-[-1]"
        floatDuration={5.5}
        floatOffset={-20}
      />

      {/* Coffee */}
      <FloatingElement
        src="/coffee-pixel-art.png"
        alt="Coffee"
        width={96}
        height={96}
        className="left-[12%] top-[40%] w-24 h-24 hidden xs:block"
        imageClassName="w-full h-full"
        floatDuration={4}
        floatOffset={-15}
      />

      {/* Android */}
      <FloatingElement
        src="/android-pixel-art.png"
        alt="Android"
        width={72}
        height={72}
        className="right-[25%] top-[35%] w-20 h-20 hidden sm:block"
        imageClassName="w-full h-full"
        floatDuration={3.5}
        floatOffset={-12}
      />

      {/* Potato */}
      <FloatingElement
        src="/potato-pixel-art.png"
        alt="Potato"
        width={84}
        height={84}
        className="left-[20%] bottom-[25%] w-20 h-20 hidden xs:block"
        imageClassName="w-full h-full"
        floatDuration={4.8}
        floatOffset={-18}
      />
    </div>
  )
}

BackgroundFloatingElements.displayName = 'BackgroundFloatingElements'
export default BackgroundFloatingElements
