import React, { useEffect } from 'react'

interface ProjectShowcaseDialogProps {
  open: boolean
  onClose: () => void
  title: string
  children?: React.ReactNode
}

export const ProjectShowcaseDialog: React.FC<ProjectShowcaseDialogProps> = ({
  open,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      const navbar = document.querySelector('nav')
      if (navbar) {
        navbar.style.display = 'none'
      }
    } else {
      document.body.style.overflow = 'unset'
      const navbar = document.querySelector('nav')
      if (navbar) {
        navbar.style.display = 'flex'
      }
    }
    return () => {
      document.body.style.overflow = 'unset'
      const navbar = document.querySelector('nav')
      if (navbar) {
        navbar.style.display = 'flex'
      }
    }
  }, [open])

  if (!open) return null

  return (
    <div className="bg-amber-100 fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md p-4 md:p-32">
      {/* Mobile View (Full Screen) */}
      <div className="md:hidden relative w-full h-full bg-background-light border-4 border-double border-black overflow-hidden">
        {/* Mobile Title Bar */}
        <div className="sticky top-0 z-10 flex flex-row justify-between items-center border-b-2 border-black border-double bg-yellow-200 overflow-hidden">
          <h2 className="text-xl font-bold p-3 px-4 font-['Press_Start_2P'] truncate">{title}</h2>
          <div className="h-12 w-12 relative border-l-2 border-black border-double">
            <button
              onClick={onClose}
              className="h-full w-full text-2xl leading-7 transition-colors duration-200 hover:bg-yellow-300 active:bg-yellow-400 font-pixel"
              aria-label="Close dialog"
              style={{ imageRendering: 'pixelated' }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Mobile Scrollable Content */}
        <div className="relative w-full h-[calc(100vh-3rem)] overflow-y-auto no-scrollbar z-1">
          {/* Gradient overlay at bottom */}
          <div className="pointer-events-none absolute bottom-0 left-0 w-full h-[40vh] bg-gradient-to-t from-background-light to-[rgba(255,248,156,0)] z-10" />
          {/* Mobile Title Container */}
          <div
            className="flex justify-center items-center w-full h-48 bg-cover bg-center relative"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,0,0,0.3),rgba(255,232,100,0.522)),url(/construction-site-pixel-art-background.jpeg)',
              imageRendering: 'pixelated',
            }}
          >
            <h1 className="font-['VT323'] text-[15vw] text-background font-bold text-background-light drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              {title}
            </h1>
          </div>
          <div className="flex flex-col gap-8 mx-auto px-4">{children}</div>
        </div>
      </div>

      {/* Desktop View (Original) */}
      <div className="hidden md:block relative w-[95vw] h-[95vh] bg-background-light rounded-xl border-4 border-double border-black overflow-hidden">
        {/* Title Bar */}
        <div className="sticky top-0 z-10 flex flex-row justify-between items-center border-b-2 border-black border-double bg-yellow-200 rounded-t-xl">
          <h2 className="text-2xl font-bold p-4 px-8 font-['Press_Start_2P']">{title}</h2>
          <div className="h-16 w-16 relative border-l-2 border-black border-double">
            <button
              onClick={onClose}
              className="h-full w-full rounded-tr-lg transition-colors duration-200 text-3xl leading-9 hover:bg-yellow-300"
              aria-label="Close dialog"
              style={{ imageRendering: 'pixelated' }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="relative w-full h-[calc(95vh-4rem)] overflow-y-auto no-scrollbar z-1">
          {/* Gradient overlay at bottom */}
          <div className="pointer-events-none absolute bottom-0 left-0 w-full h-[70vh] bg-gradient-to-t from-background-light to-[rgba(255,248,156,0)] z-10" />
          {/* Main Title Container */}
          <div
            className="flex justify-center items-center w-full h-full bg-cover bg-center relative"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,0,0,0.3),rgba(255,232,100,0.522)),url(/construction-site-pixel-art-background.jpeg)',
              imageRendering: 'pixelated',
            }}
          >
            <h1 className="font-['VT323'] text-[14vw] text-background font-bold text-background-light drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]">
              {title}
            </h1>
          </div>
          <div className="flex flex-col gap-12 mx-auto px-16">{children}</div>
        </div>
      </div>
    </div>
  )
}
