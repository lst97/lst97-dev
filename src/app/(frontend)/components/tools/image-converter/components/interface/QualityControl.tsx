'use client'

import React from 'react'
import { PixelSlider } from '@/frontend/components/ui/Slider'

type QualityControlProps = {
  quality: number
  setQuality: (quality: number) => void
}

export const QualityControl: React.FC<QualityControlProps> = ({ quality, setQuality }) => {
  const handleValueChange = (values: number[]) => {
    setQuality(values[0])
  }

  return (
    <div className="p-4 border-4 border-border rounded-none bg-background-color/30 shadow-[4px_4px_0px_#000]">
      <PixelSlider
        value={[quality]}
        onValueChange={handleValueChange}
        min={10}
        max={100}
        step={1}
        label="Quality"
        lowLabel="Low"
        highLabel="High"
        fullWidth
      />
    </div>
  )
}
