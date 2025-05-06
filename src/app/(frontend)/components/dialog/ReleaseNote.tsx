import { PlainDialog } from '@/frontend/components/ui/Dialogs'
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
  // Handle body overflow when modal is open/closed
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  return (
    <PlainDialog open={open} onClose={onClose} title={title}>
      <div className="space-y-6 text-sm max-h-[60vh] overflow-y-auto pr-4">
        <section>
          <h2 className="text-lg font-bold mb-2">Overview</h2>
          <p>{releaseNoteData.overview}</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">Project Description</h2>
          <p>{releaseNoteData.projectDescription}</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">Features in This Release</h2>
          <ul className="list-disc pl-5 space-y-2">
            {releaseNoteData.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">Known Issues</h2>
          <ul className="list-disc pl-5 space-y-2">
            {releaseNoteData.knownIssues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">Future Development</h2>
          <p>Future releases will focus on:</p>
          <ul className="list-disc pl-5 space-y-1">
            {releaseNoteData.futureDevelopment.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">Dependencies</h2>
          <p className="mb-2">This project uses the following key dependencies:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {releaseNoteData.dependencies.map((dep, index) => (
              <div key={index}>{dep}</div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">Development Tools</h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {releaseNoteData.devDependencies.map((devDep, index) => (
              <div key={index}>{devDep}</div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">Feedback</h2>
          <p>{releaseNoteData.feedback}</p>
        </section>
      </div>
    </PlainDialog>
  )
}

export default ReleaseNote
