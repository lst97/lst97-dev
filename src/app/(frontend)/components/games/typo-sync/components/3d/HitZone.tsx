'use client'

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTypoSyncStore } from '../../store'
import type { Keystroke, GameConfig } from '../../types'
import { GAME_CONFIG, CANVAS_HEIGHT, screenToGameSpace } from '../../config'

interface HitZoneProps {
  keystrokeMap: Keystroke[]
  gameTime: number
  beatTimestamps: number[]
  gameConfig?: GameConfig
  onKeystrokeUpdate?: (keystroke: Keystroke) => void
}

export function HitZone({
  keystrokeMap,
  gameTime,
  beatTimestamps,
  gameConfig = GAME_CONFIG,
  onKeystrokeUpdate,
}: HitZoneProps) {
  const lineRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!lineRef.current || !glowRef.current) return

    const { gameState } = useTypoSyncStore.getState()

    if (gameState.isPaused) return

    let rubberExpansion = 1.0
    let glowIntensity = 0.3

    for (const beatTime of beatTimestamps) {
      const timeDiff = Math.abs(gameTime - beatTime)

      if (timeDiff <= 0.15) {
        const beatProgress = 1.0 - timeDiff / 0.15

        const expansionPhase = (Date.now() % 400) / 400
        const sineWave = Math.sin(expansionPhase * Math.PI * 2)

        rubberExpansion = 1.0 + sineWave * 0.4 * beatProgress
        glowIntensity = 0.3 + beatProgress * 0.6
        break
      }
    }

    lineRef.current.scale.set(1.0, rubberExpansion, 1.0)

    const glowMaterial = glowRef.current.material as THREE.MeshBasicMaterial
    glowMaterial.opacity = glowIntensity
  })

  const hitZoneWorldPos = screenToGameSpace(gameConfig.HIT_ZONE_X, CANVAS_HEIGHT / 2)

  return (
    <group position={[hitZoneWorldPos.x, 0, 0]}>
      <group ref={lineRef}>
        <mesh ref={glowRef}>
          <planeGeometry args={[0.25, 4.8]} />
          <meshBasicMaterial color="#d4a574" transparent opacity={0.8} />
        </mesh>

        <mesh position={[-0.15, 0, 0.01]}>
          <planeGeometry args={[0.05, 4.8]} />
          <meshBasicMaterial color="#4a4a4a" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0.15, 0, 0.01]}>
          <planeGeometry args={[0.05, 4.8]} />
          <meshBasicMaterial color="#4a4a4a" transparent opacity={0.7} />
        </mesh>

        <mesh position={[0, 2.4, 0.01]}>
          <planeGeometry args={[0.35, 0.05]} />
          <meshBasicMaterial color="#4a4a4a" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, -2.4, 0.01]}>
          <planeGeometry args={[0.35, 0.05]} />
          <meshBasicMaterial color="#4a4a4a" transparent opacity={0.7} />
        </mesh>

        <mesh position={[-0.08, 0, 0.02]}>
          <planeGeometry args={[0.04, 4.2]} />
          <meshBasicMaterial color="#e6c794" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0.08, 0, 0.02]}>
          <planeGeometry args={[0.04, 4.2]} />
          <meshBasicMaterial color="#b8965a" transparent opacity={0.5} />
        </mesh>
      </group>
    </group>
  )
}
