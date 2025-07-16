'use client'

import React, { useRef, useEffect, useMemo, useState, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useTypoSyncStore } from '../../store'
import type { Keystroke, GameConfig } from '../../types'
import { PixelParticle } from './PixelParticle'
import { GAME_CONFIG, CANVAS_HEIGHT, screenToGameSpace } from '../../config'

interface KeystrokeNoteProps {
  keystroke: Keystroke
  gameTime: number
  gameConfig?: GameConfig
  onKeystrokeUpdate?: (keystroke: Keystroke) => void
}

export function KeystrokeNote({
  keystroke,
  gameTime,
  gameConfig = GAME_CONFIG,
  onKeystrokeUpdate,
}: KeystrokeNoteProps) {
  // Call all hooks unconditionally
  const groupRef = useRef<THREE.Group>(null)
  const boxRef = useRef<THREE.Mesh>(null)
  const [isBreaking, setIsBreaking] = useState(false)
  const [breakStartTime, setBreakStartTime] = useState(0)
  const [fadeOpacity, setFadeOpacity] = useState(1.0)
  const [pixelParticles, setPixelParticles] = useState<
    Array<{
      id: number
      position: [number, number, number]
      velocity: [number, number, number]
      startTime: number
      size: number
      rotationSpeed: [number, number, number]
      color: string
      isFireParticle?: boolean
    }>
  >([])

  const prevStateRef = useRef(keystroke?.state)

  const uniqueId = useMemo(() => {
    // Ensure startTime is valid before using toFixed
    const timeStr =
      keystroke && Number.isFinite(keystroke.startTime) ? keystroke.startTime.toFixed(4) : '0.0000'
    const key = keystroke?.key || ''
    const type = keystroke?.type || ''

    return `${timeStr}-${key}-${type}-${Math.random().toString(36).substring(2, 11)}`
  }, [keystroke])

  const displayKey = useMemo(() => {
    if (!keystroke?.key) return ''

    switch (keystroke.key) {
      case '[Space]':
        return '▭'
      case '[Enter]':
        return '↵'
      default:
        return keystroke.key
    }
  }, [keystroke?.key])

  const boxColor = useMemo(() => {
    if (!keystroke?.state) return 'rgb(252, 211, 77)'

    switch (keystroke.state) {
      case 'hit':
        return gameConfig.COLORS.HIT
      case 'missed':
        return gameConfig.COLORS.MISSED
      case 'typo':
        return gameConfig.COLORS.TYPO
      default:
        return 'rgb(252, 211, 77)'
    }
  }, [keystroke?.state, gameConfig])

  const textColor = useMemo(() => {
    if (!keystroke?.state) return '#000000'

    switch (keystroke.state) {
      case 'hit':
        return '#000000'
      case 'missed':
        return '#FFFFFF'
      case 'typo':
        return '#000000'
      default:
        return '#000000'
    }
  }, [keystroke?.state])

  // Validation check - ensure all required props are valid
  const isValidProps =
    keystroke &&
    Number.isFinite(keystroke.startTime) &&
    keystroke.key &&
    keystroke.type &&
    Number.isFinite(gameTime)

  // All hooks must be called unconditionally
  useEffect(() => {
    if (!isValidProps) {
      console.error('Invalid KeystrokeNote props detected:', {
        keystroke,
        gameTime,
        hasValidStartTime: keystroke ? Number.isFinite(keystroke.startTime) : false,
        hasValidKey: keystroke ? !!keystroke.key : false,
        hasValidType: keystroke ? !!keystroke.type : false,
        hasValidGameTime: Number.isFinite(gameTime),
      })
      return
    }

    const prevState = prevStateRef.current
    const currentState = keystroke.state

    // Notify parent component about keystroke state change
    if (prevState !== currentState && onKeystrokeUpdate) {
      onKeystrokeUpdate(keystroke)
    }

    if (
      prevState === 'upcoming' &&
      (currentState === 'hit' || currentState === 'missed' || currentState === 'typo') &&
      !isBreaking
    ) {
      setIsBreaking(true)
      setBreakStartTime(Date.now())

      const particles = []
      let numParticles: number
      let velocityMultiplier: number
      let sizeMultiplier: number
      let particleColor: string

      switch (keystroke.timingAccuracy) {
        case 'sync':
          numParticles = Math.min(8 + Math.floor(Math.random() * 4), 10) // Cap at 10
          velocityMultiplier = 2.0
          sizeMultiplier = 1.2
          particleColor = '#00ff88'
          break
        case 'early':
        case 'late':
          numParticles = Math.min(6 + Math.floor(Math.random() * 3), 8) // Cap at 8
          velocityMultiplier = 1.0
          sizeMultiplier = 0.8
          particleColor = '#ffaa00'
          break
        case 'miss':
        default:
          numParticles = 0
          velocityMultiplier = 0
          sizeMultiplier = 0
          particleColor = '#ff4444'
          break
      }

      if (currentState === 'typo' || currentState === 'missed') {
        numParticles = Math.min(8 + Math.floor(Math.random() * 4), 10) // Cap at 10
        velocityMultiplier = 1.5
        sizeMultiplier = 0.9
        particleColor = currentState === 'typo' ? '#ff4444' : '#ff6666'
      }

      if (keystroke.type === 'hidden') {
        particleColor = '#d8b4fe'
      }

      if (numParticles === 0) {
        return
      }

      for (let i = 0; i < numParticles; i++) {
        let particleVelocity: [number, number, number]

        const boxEdgeX = (Math.random() - 0.5) * 0.8
        const boxEdgeY = (Math.random() - 0.5) * 0.8
        const boxEdgeZ = 0.1 + Math.random() * 0.2

        const particlePosition: [number, number, number] = [boxEdgeX, boxEdgeY, boxEdgeZ]

        if (currentState === 'typo' || currentState === 'missed') {
          particleVelocity = [
            (Math.random() - 0.5) * 2 * velocityMultiplier,
            (Math.random() * 4 + 2) * velocityMultiplier,
            (Math.random() - 0.5) * 1 * velocityMultiplier,
          ]
        } else if (keystroke.timingAccuracy === 'sync') {
          particleVelocity = [
            -(Math.random() * 8 + 4) * velocityMultiplier,
            (Math.random() * 3 + 1) * velocityMultiplier,
            (Math.random() - 0.5) * 2 * velocityMultiplier,
          ]
        } else {
          particleVelocity = [
            (Math.random() - 0.5) * 6 * velocityMultiplier,
            (Math.random() * 4 + 1) * velocityMultiplier,
            (Math.random() - 0.5) * 3 * velocityMultiplier,
          ]
        }

        particles.push({
          id: i,
          position: particlePosition,
          velocity: particleVelocity,
          startTime: Date.now(),
          size: (0.08 + Math.random() * 0.12) * sizeMultiplier,
          rotationSpeed: [
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
          ] as [number, number, number],
          color: particleColor,
          isFireParticle: currentState === 'typo' || currentState === 'missed',
        })
      }

      setPixelParticles(particles)
    }

    prevStateRef.current = currentState
  }, [
    keystroke,
    keystroke?.state,
    keystroke?.timingAccuracy,
    isBreaking,
    uniqueId,
    gameTime,
    onKeystrokeUpdate,
    isValidProps,
  ])

  useEffect(() => {
    if (!isValidProps) return

    const timeDifference = keystroke.startTime - gameTime
    const distance = timeDifference * gameConfig.NOTE_SPEED_PPS
    const screenX = gameConfig.HIT_ZONE_X + distance

    if (screenX < -400 && isBreaking) {
      const animationAge = (Date.now() - breakStartTime) / 1000
      if (animationAge > 6.0) {
        setIsBreaking(false)
        setPixelParticles([])
        setBreakStartTime(0)
      }
    }
  }, [
    gameTime,
    keystroke?.startTime,
    gameConfig.HIT_ZONE_X,
    gameConfig.NOTE_SPEED_PPS,
    uniqueId,
    isBreaking,
    breakStartTime,
    isValidProps,
  ])

  // Cleanup particles when component unmounts or after extended time
  useEffect(() => {
    return () => {
      // Clean up particles when component unmounts
      setPixelParticles([])
    }
  }, [])

  // Emergency cleanup for particles after 10 seconds
  useEffect(() => {
    if (pixelParticles.length > 0) {
      const emergencyCleanup = setTimeout(() => {
        setPixelParticles([])
        setIsBreaking(false)
      }, 10000) // 10 seconds max particle lifetime

      return () => clearTimeout(emergencyCleanup)
    }
  }, [pixelParticles.length])

  useFrame(() => {
    if (!groupRef.current || !isValidProps) return

    const { gameState } = useTypoSyncStore.getState()

    if (gameState.isPaused) return

    // Data validation: Check for invalid values that would crash WebGL
    if (
      !Number.isFinite(keystroke.startTime) ||
      !Number.isFinite(gameTime) ||
      !Number.isFinite(gameConfig.NOTE_SPEED_PPS) ||
      !Number.isFinite(gameConfig.HIT_ZONE_X)
    ) {
      console.warn('Invalid data detected in KeystrokeNote, skipping frame', {
        startTime: keystroke.startTime,
        gameTime,
        noteSpeed: gameConfig.NOTE_SPEED_PPS,
        hitZone: gameConfig.HIT_ZONE_X,
      })
      return
    }

    const timeDifference = keystroke.startTime - gameTime
    const distance = timeDifference * gameConfig.NOTE_SPEED_PPS

    const screenX = gameConfig.HIT_ZONE_X + distance
    const screenY = CANVAS_HEIGHT / 2

    const worldPos = screenToGameSpace(screenX, screenY)

    // Validate world position before applying to Three.js object
    if (!Number.isFinite(worldPos.x) || !Number.isFinite(worldPos.y)) {
      console.warn('Invalid world position calculated, skipping frame', {
        worldPos,
        screenX,
        screenY,
        timeDifference,
        distance,
      })
      return
    }

    const shouldBeHidden = keystroke.state === 'hit' || keystroke.state === 'missed'

    if (isBreaking) {
      const breakTime = (Date.now() - breakStartTime) / 1000
      const breakDuration = 5.0
      const fadeOutDuration = 0.5

      if (keystroke.state === 'missed' || keystroke.state === 'typo') {
        const fadeProgress = Math.min(breakTime / fadeOutDuration, 1.0)
        const opacity = 1.0 - fadeProgress
        setFadeOpacity(opacity)

        groupRef.current.visible = opacity > 0
      } else {
        groupRef.current.visible = false
      }

      if (breakTime >= breakDuration && pixelParticles.length > 0) {
        setPixelParticles([])
      }
    } else if (shouldBeHidden) {
      groupRef.current.visible = false
    } else {
      groupRef.current.position.x = worldPos.x
      groupRef.current.position.y = worldPos.y
      groupRef.current.position.z = 0
      groupRef.current.scale.setScalar(1)
      groupRef.current.rotation.set(0, 0, 0)
      groupRef.current.visible = true
      setFadeOpacity(1.0)
    }
  })

  // Early return after all hooks have been called
  if (!isValidProps) {
    return null
  }

  return (
    <>
      <group ref={groupRef}>
        <Box args={[0.9, 0.9, 0.08]}>
          <meshBasicMaterial
            color="#666666"
            transparent
            opacity={Number.isFinite(fadeOpacity) ? fadeOpacity : 1.0}
          />
        </Box>

        <Box ref={boxRef} args={[0.8, 0.8, 0.1]}>
          <meshBasicMaterial
            color={boxColor}
            transparent
            opacity={Number.isFinite(fadeOpacity) ? fadeOpacity : 1.0}
          />
        </Box>

        {/* TODO: Do a bug report to Github. the previous commit does not require Suspense. No useful log about this error, just a warning - WebGL context lost. */}
        <Suspense fallback={null}>
          <Text
            position={[0, 0, 0.06]}
            fontSize={0.4}
            color={textColor}
            anchorX="center"
            anchorY="middle"
            font="/fonts/PressStart2P-Regular.ttf"
            outlineWidth={0.008}
            outlineColor="#FFFFFF"
            visible={Number.isFinite(fadeOpacity) && fadeOpacity > 0}
          >
            {displayKey}
          </Text>
        </Suspense>
      </group>

      {isBreaking &&
        pixelParticles.map((particle) => {
          const currentPos = groupRef.current?.position || new THREE.Vector3(0, 0, 0)
          const particleWorldPos: [number, number, number] = [
            currentPos.x + particle.position[0],
            currentPos.y + particle.position[1],
            currentPos.z + particle.position[2],
          ]

          return (
            <PixelParticle
              key={`${uniqueId}-particle-${particle.id}`}
              position={particleWorldPos}
              velocity={particle.velocity}
              startTime={particle.startTime}
              size={particle.size}
              rotationSpeed={particle.rotationSpeed}
              color={particle.color}
              isFireParticle={particle.isFireParticle}
            />
          )
        })}
    </>
  )
}
