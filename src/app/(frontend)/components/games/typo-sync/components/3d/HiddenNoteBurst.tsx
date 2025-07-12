'use client'

import React, { useState } from 'react'
import type { Keystroke } from '../../types'
import { PixelParticle } from './PixelParticle'
import { GAME_CONFIG, CANVAS_HEIGHT, screenToGameSpace } from '../../config'

interface HiddenBurstProps {
  note: Keystroke
  gameTime: number
}

export function HiddenNoteBurst({ note, gameTime }: HiddenBurstProps) {
  const [particles] = useState(() => {
    const parts = []
    const num = 12
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
