'use client'

import React, { useState, useEffect } from 'react'
import type { Keystroke } from '../../types'
import { PixelParticle } from './PixelParticle'
import { GAME_CONFIG, CANVAS_HEIGHT, screenToGameSpace } from '../../config'

interface HiddenBurstProps {
  note: Keystroke
  gameTime: number
}

export function HiddenNoteBurst({ note }: HiddenBurstProps) {
  const [particles, setParticles] = useState(() => {
    const parts = []
    const num = 8 // Reduced from 12 to 8 for better performance
    const hitZoneWorld = screenToGameSpace(GAME_CONFIG.HIT_ZONE_X, CANVAS_HEIGHT / 2)

    for (let i = 0; i < num; i++) {
      parts.push({
        id: i,
        position: [
          hitZoneWorld.x + (Math.random() - 0.5) * 0.4,
          hitZoneWorld.y + (Math.random() - 0.5) * 4.0,
          0.1 + Math.random() * 0.2,
        ] as [number, number, number],
        velocity: [
          (Math.random() - 0.5) * 3,
          Math.random() * 1.5 + 0.5,
          (Math.random() - 0.5) * 1.5,
        ] as [number, number, number],
        startTime: Date.now(),
        size: 0.08 + Math.random() * 0.1,
        rotationSpeed: [
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6,
        ] as [number, number, number],
        color: '#d8b4fe',
      })
    }
    return parts
  })

  const [isVisible, setIsVisible] = useState(true)

  // Cleanup particles after 4 seconds to prevent memory leaks
  useEffect(() => {
    const lifetime = 4000 // 4 seconds (reduced from 6)
    const timer = setTimeout(() => {
      setIsVisible(false)
      setParticles([]) // Clear particles from state
    }, lifetime)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  // Don't render if not visible
  if (!isVisible || particles.length === 0) {
    return null
  }

  return (
    <>
      {particles.map((p) => (
        <PixelParticle
          key={`hidden-${note.startTime}-${p.id}`}
          position={p.position}
          velocity={p.velocity}
          startTime={p.startTime}
          size={p.size}
          rotationSpeed={p.rotationSpeed}
          color={p.color}
        />
      ))}
    </>
  )
}
