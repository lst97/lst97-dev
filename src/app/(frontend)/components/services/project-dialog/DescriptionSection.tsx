import React from 'react'

interface DescriptionSectionProps {
  description: string
}

export const DescriptionSection: React.FC<DescriptionSectionProps> = ({ description }) => (
  <div className="font-['Press_Start_2P'] p-8">
    <h4 className=" text-3xl text-primary drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)]">
      ABOUT THE PROJECT
    </h4>
    <p className=" text-black/40 text-lg">{description}</p>
  </div>
)
