import Image from 'next/image'
import { FaSearch } from 'react-icons/fa'
import { useRef, useEffect, useState } from 'react'

interface ProjectShowcaseCardProps {
  title: string
  description: string
  image: string
  onExplore: () => void
}

export const ProjectShowcaseCard = ({
  title,
  description,
  image,
  onExplore,
}: ProjectShowcaseCardProps) => {
  const [isCompact, setIsCompact] = useState(false)
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkLayout = () => {
      if (containerRef.current) {
        const windowWidth = window.innerWidth
        // Check if width is below a threshold where we should switch to compact mode
        setIsCompact(windowWidth < 1024 || containerRef.current.offsetWidth < 800)
        setIsMobileOrTablet(windowWidth < 768) // md breakpoint
      }
    }

    checkLayout()
    window.addEventListener('resize', checkLayout)
    return () => window.removeEventListener('resize', checkLayout)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full md:w-[90%] lg:w-[80%] xl:w-[70%] bg-yellow-50 border-4 border-neutral-800 shadow-[8px_8px_0_rgba(44,44,44,0.2)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_rgba(44,44,44,0.2)] rounded-lg overflow-hidden mx-auto"
    >
      <div className="absolute inset-0 pixel-pattern-2 opacity-20"></div>

      {/* Main Content */}
      <div className="flex flex-col p-3 sm:p-4 md:p-5 lg:p-6 gap-4 lg:gap-6">
        {/* Monitor and optionally vertical title */}
        <div
          className={`relative flex ${isCompact && !isMobileOrTablet ? 'flex-row' : 'flex-col lg:flex-row lg:gap-8'}`}
        >
          {/* Monitor Frame with Image */}
          <div className="relative h-[500px] w-[500px] flex-shrink-0 mx-auto lg:mx-0">
            <Image
              src="/monitor-pixel-art.svg"
              alt="Monitor frame"
              width={500}
              height={500}
              className="absolute top-0 left-0 w-full h-full pointer-events-none z-[1]"
            />
            <div className="absolute top-[18%] left-[16%] w-[68%] h-[46%] lg:top-[91px] lg:left-[79px] lg:w-[1370px] lg:h-[915px] lg:scale-[0.25] lg:origin-top-left overflow-hidden z-[2]">
              <Image
                src={image}
                alt={title}
                width={400}
                height={400}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              />
            </div>
          </div>

          {/* Desktop layout options */}
          {!isMobileOrTablet && (
            <>
              {/* Vertical Title (compact desktop mode) */}
              {isCompact && (
                <div className="absolute top-1/2 translate-y-16 right-4 sm:right-8 md:right-1">
                  <h3 className="font-['Press_Start_2P'] text-xl sm:text-2xl md:text-3xl transform rotate-90 origin-right text-text drop-shadow-[2px_2px_0_rgba(44,44,44,0.2)]">
                    {title}
                  </h3>
                </div>
              )}

              {/* Horizontal Title and Description (non-compact desktop mode) */}
              {!isCompact && (
                <div className="flex flex-col gap-3 md:gap-4 flex-grow min-w-0 pt-4 px-2 sm:px-4 md:px-6 lg:pt-8 lg:pr-8">
                  <h3 className="font-['Press_Start_2P'] text-xl sm:text-2xl md:text-3xl lg:text-4xl text-neutral-800 drop-shadow-[2px_2px_0_rgba(44,44,44,0.2)] break-words">
                    {title}
                  </h3>
                  <p className="font-['Press_Start_2P'] text-xs sm:text-sm text-neutral-800 leading-relaxed break-words">
                    {description}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile/Tablet layout OR Description for compact desktop */}
        {(isMobileOrTablet || (isCompact && !isMobileOrTablet)) && (
          <div className="flex flex-col gap-3 md:gap-4 px-2 sm:px-4 mt-4">
            {/* Show title horizontally on mobile/tablet */}
            {isMobileOrTablet && (
              <h3 className="font-['Press_Start_2P'] text-xl sm:text-2xl md:text-3xl text-neutral-800 drop-shadow-[2px_2px_0_rgba(44,44,44,0.2)] break-words">
                {title}
              </h3>
            )}
            <p className="font-['Press_Start_2P'] text-xs sm:text-sm text-neutral-800 leading-relaxed break-words">
              {description}
            </p>
          </div>
        )}
      </div>

      {/* Bottom - Explore Button */}
      <button
        onClick={onExplore}
        className="font-['Press_Start_2P',monospace] text-xs sm:text-sm md:text-base p-2 sm:p-3 md:p-4 bg-neutral-800 text-yellow-100 border-2 border-t-2 border-neutral-800 cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[4px_4px_0_rgba(44,44,44,0.2)] flex items-center justify-center gap-2 relative overflow-hidden w-full hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(44,44,44,0.2)] hover:bg-yellow-500"
      >
        <FaSearch className="text-sm md:text-lg" />
        <span>Explore Project</span>
      </button>
    </div>
  )
}
