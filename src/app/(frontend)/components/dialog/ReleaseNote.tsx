import React, { useEffect } from 'react'
import { releaseNoteData } from '@/frontend/constants/data/release-note'

interface ReleaseNoteProps {
  open: boolean
  onClose: () => void
  title?: string
}

export const ReleaseNote: React.FC<ReleaseNoteProps> = ({
  open,
  onClose,
  title = releaseNoteData.title,
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
    <div className="bg-amber-100 fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md p-4 md:p-8">
      {/* Mobile View (Full Screen) */}
      <div className="md:hidden relative w-full h-full bg-background-light border-4 border-double border-black overflow-hidden">
        {/* Mobile Title Bar */}
        <div className="sticky top-0 z-10 flex flex-row justify-between items-center border-b-2 border-black border-double bg-yellow-200 overflow-hidden">
          <h2 className="text-sm font-bold p-3 px-4 font-['Press_Start_2P'] truncate">{title}</h2>
          <div className="h-12 w-12 relative border-l-2 border-black border-double">
            <button
              onClick={onClose}
              className="h-full w-full text-2xl leading-7 transition-colors duration-200 hover:bg-yellow-300 active:bg-yellow-400"
              aria-label="Close dialog"
              style={{ imageRendering: 'pixelated' }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Mobile Scrollable Content */}
        <div className="relative w-full h-[calc(100vh-3rem)] overflow-y-auto no-scrollbar">
          {/* Gradient overlay at bottom */}
          <div className="pointer-events-none absolute bottom-0 left-0 w-full h-[20vh] bg-gradient-to-t from-background-light to-[rgba(255,248,156,0)] z-10" />

          <div className="space-y-6 text-xs p-4 pb-24">
            <section>
              <h3 className="text-sm font-['Press_Start_2P'] font-bold mb-3 text-primary">
                Overview
              </h3>
              <p className="font-['Press_Start_2P'] leading-relaxed">{releaseNoteData.overview}</p>
            </section>

            <section>
              <h3 className="text-sm font-['Press_Start_2P'] font-bold mb-3 text-primary">
                Project Description
              </h3>
              <p className="font-['Press_Start_2P'] leading-relaxed">
                {releaseNoteData.projectDescription}
              </p>
            </section>

            <section>
              <h3 className="text-sm font-['Press_Start_2P'] font-bold mb-3 text-primary">
                Features in This Release
              </h3>
              <ul className="list-disc pl-5 space-y-2 font-['Press_Start_2P']">
                {releaseNoteData.features.map((feature, index) => (
                  <li key={index} className="leading-relaxed">
                    {feature}
                  </li>
                ))}
              </ul>
            </section>

            {releaseNoteData.changelog && (
              <section>
                <h3 className="text-sm font-['Press_Start_2P'] font-bold mb-3 text-primary">
                  Changelog
                </h3>
                <div className="space-y-4">
                  {releaseNoteData.changelog.map((version, index) => (
                    <div
                      key={index}
                      className="bg-card border-2 border-border p-3 shadow-[2px_2px_0px_#000]"
                    >
                      <h4 className="font-['Press_Start_2P'] text-xs font-bold mb-2 text-accent-color">
                        {version.version} - {version.date}
                      </h4>
                      <ul className="list-disc pl-4 space-y-1 font-['Press_Start_2P'] text-xs">
                        {version.changes.map((change, changeIndex) => (
                          <li key={changeIndex} className="leading-relaxed">
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="text-sm font-['Press_Start_2P'] font-bold mb-3 text-primary">
                Known Issues
              </h3>
              <ul className="list-disc pl-5 space-y-2 font-['Press_Start_2P']">
                {releaseNoteData.knownIssues.map((issue, index) => (
                  <li key={index} className="leading-relaxed">
                    {issue}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-['Press_Start_2P'] font-bold mb-3 text-primary">
                Future Development
              </h3>
              <p className="font-['Press_Start_2P'] mb-2">Future releases will focus on:</p>
              <ul className="list-disc pl-5 space-y-1 font-['Press_Start_2P']">
                {releaseNoteData.futureDevelopment.map((item, index) => (
                  <li key={index} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-['Press_Start_2P'] font-bold mb-3 text-primary">
                Dependencies
              </h3>
              <p className="font-['Press_Start_2P'] mb-2">
                This project uses the following key dependencies:
              </p>
              <div className="grid grid-cols-1 gap-1 text-xs">
                {releaseNoteData.dependencies.map((dep, index) => (
                  <div
                    key={index}
                    className="font-['Press_Start_2P'] bg-card-background p-2 border border-border"
                  >
                    {dep}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-['Press_Start_2P'] font-bold mb-3 text-primary">
                Development Tools
              </h3>
              <div className="grid grid-cols-1 gap-1 text-xs">
                {releaseNoteData.devDependencies.map((devDep, index) => (
                  <div
                    key={index}
                    className="font-['Press_Start_2P'] bg-card-background p-2 border border-border"
                  >
                    {devDep}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-['Press_Start_2P'] font-bold mb-3 text-primary">
                Feedback
              </h3>
              <div
                className="font-['Press_Start_2P'] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: releaseNoteData.feedback }}
              />
            </section>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block relative w-[90vw] max-w-4xl h-[90vh] bg-background-light rounded-xl border-4 border-double border-black overflow-hidden">
        {/* Desktop Title Bar */}
        <div className="sticky top-0 z-10 flex flex-row justify-between items-center border-b-2 border-black border-double bg-yellow-200 rounded-t-xl">
          <h2 className="text-xl font-bold p-4 px-6 font-['Press_Start_2P']">{title}</h2>
          <div className="h-14 w-14 relative border-l-2 border-black border-double">
            <button
              onClick={onClose}
              className="h-full w-full rounded-tr-lg transition-colors duration-200 text-2xl leading-8 hover:bg-yellow-300"
              aria-label="Close dialog"
              style={{ imageRendering: 'pixelated' }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Desktop Scrollable Content */}
        <div className="relative w-full h-[calc(90vh-3.5rem)] overflow-y-auto no-scrollbar">
          {/* Gradient overlay at bottom */}
          <div className="pointer-events-none absolute bottom-0 left-0 w-full h-[20vh] bg-gradient-to-t from-background-light to-[rgba(255,248,156,0)] z-10" />

          <div className="space-y-8 text-sm p-6 pb-32">
            <section>
              <h3 className="text-lg font-['Press_Start_2P'] font-bold mb-4 text-primary">
                Overview
              </h3>
              <p className="font-['Press_Start_2P'] leading-relaxed">{releaseNoteData.overview}</p>
            </section>

            <section>
              <h3 className="text-lg font-['Press_Start_2P'] font-bold mb-4 text-primary">
                Project Description
              </h3>
              <p className="font-['Press_Start_2P'] leading-relaxed">
                {releaseNoteData.projectDescription}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-['Press_Start_2P'] font-bold mb-4 text-primary">
                Features in This Release
              </h3>
              <ul className="list-disc pl-6 space-y-3 font-['Press_Start_2P']">
                {releaseNoteData.features.map((feature, index) => (
                  <li key={index} className="leading-relaxed">
                    {feature}
                  </li>
                ))}
              </ul>
            </section>

            {releaseNoteData.changelog && (
              <section>
                <h3 className="text-lg font-['Press_Start_2P'] font-bold mb-4 text-primary">
                  Changelog
                </h3>
                <div className="space-y-6">
                  {releaseNoteData.changelog.map((version, index) => (
                    <div
                      key={index}
                      className="bg-card border-4 border-border p-4 shadow-[4px_4px_0px_#000]"
                    >
                      <h4 className="font-['Press_Start_2P'] text-base font-bold mb-3 text-accent-color">
                        {version.version} - {version.date}
                      </h4>
                      <ul className="list-disc pl-6 space-y-2 font-['Press_Start_2P']">
                        {version.changes.map((change, changeIndex) => (
                          <li key={changeIndex} className="leading-relaxed">
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="text-lg font-['Press_Start_2P'] font-bold mb-4 text-primary">
                Known Issues
              </h3>
              <ul className="list-disc pl-6 space-y-3 font-['Press_Start_2P']">
                {releaseNoteData.knownIssues.map((issue, index) => (
                  <li key={index} className="leading-relaxed">
                    {issue}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-['Press_Start_2P'] font-bold mb-4 text-primary">
                Future Development
              </h3>
              <p className="font-['Press_Start_2P'] mb-3">Future releases will focus on:</p>
              <ul className="list-disc pl-6 space-y-2 font-['Press_Start_2P']">
                {releaseNoteData.futureDevelopment.map((item, index) => (
                  <li key={index} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-['Press_Start_2P'] font-bold mb-4 text-primary">
                Dependencies
              </h3>
              <p className="font-['Press_Start_2P'] mb-3">
                This project uses the following key dependencies:
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {releaseNoteData.dependencies.map((dep, index) => (
                  <div
                    key={index}
                    className="font-['Press_Start_2P'] bg-card-background p-2 border border-border"
                  >
                    {dep}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-['Press_Start_2P'] font-bold mb-4 text-primary">
                Development Tools
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {releaseNoteData.devDependencies.map((devDep, index) => (
                  <div
                    key={index}
                    className="font-['Press_Start_2P'] bg-card-background p-2 border border-border"
                  >
                    {devDep}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-['Press_Start_2P'] font-bold mb-4 text-primary">
                Feedback
              </h3>
              <div
                className="font-['Press_Start_2P'] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: releaseNoteData.feedback }}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReleaseNote
