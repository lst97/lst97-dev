import React from 'react'

interface PresentationSectionProps {
  presentation: string
}

export const PresentationSection: React.FC<PresentationSectionProps> = ({ presentation }) => (
  <div className="font-['Press_Start_2P'] p-8">
    <h3 className="text-3xl font-extrabold text-primary pb-8 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)]">
      PRESENTATION
    </h3>
    <p className="pb-8 text-md text-black/40">{presentation}</p>
  </div>
)
