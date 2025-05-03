'use client'

import React from 'react'

interface MarkerProps {
  icon?: string
  isActive?: boolean
  className?: string
  style?: React.CSSProperties
}

const Marker: React.FC<MarkerProps> = ({ icon, isActive, className, style }) => (
  <div
    className={`absolute -translate-x-1/2 w-3 h-3 flex items-center justify-center ${
      isActive ? 'border-2 border-accent' : ''
    } ${className || ''}`}
    style={style}
  >
    {icon ? (
      <span className="text-xs">{icon}</span>
    ) : (
      <div className={`w-2 h-2 rounded-full bg-accent ${isActive ? 'border border-accent' : ''}`} />
    )}
  </div>
)

interface VerticalLineProps {
  className?: string
  markers: Array<{
    id: string
    icon?: string
    isActive?: boolean
  }>
}

export const VerticalLine: React.FC<VerticalLineProps> = ({ className, markers }) => {
  const totalHeight = 100 // percentage
  const spacing = totalHeight / (markers.length + 1)

  return (
    <div className={`absolute left-0 top-5 bottom-0 w-6 ${className || ''}`}>
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-accent -translate-x-1/2" />
      {markers.map((marker, index) => (
        <Marker
          key={marker.id}
          icon={marker.icon}
          isActive={marker.isActive}
          className="absolute left-1/2"
          style={{
            top: `${spacing * (index + 1)}%`,
          }}
        />
      ))}
    </div>
  )
}
