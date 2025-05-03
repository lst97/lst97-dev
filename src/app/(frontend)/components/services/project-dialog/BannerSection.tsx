import React from 'react'

interface BannerSectionProps {
  bannerText: string
}

export const BannerSection: React.FC<BannerSectionProps> = ({ bannerText }) => (
  <div className="p-8 mb-16">
    <p className="font-['VT323'] text-6xl font-bold text-center text-primary drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)] leading-14">
      {bannerText}
    </p>
  </div>
)
