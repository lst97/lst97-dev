'use client'

import React, { useRef, useEffect, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Box } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { useTypoSyncStore } from '../store/typoSyncStore'
import { RollingNumber } from './RollingDigit'
import type { ThreeGameRendererProps, Keystroke, GameConfig } from '../types'

/**
 * Game configuration constants matching the POC design
 */
const GAME_CONFIG: GameConfig = {
  NOTE_SPEED_PPS: 300, // Faster note speed for more spacing
  HIT_ZONE_X: 150, // Moved hit zone left to give more room for upcoming notes
  NOTE_FONT: '32px Consolas',
  COLORS: {
    UPCOMING: '#FFFFFF', // White
    HIT: '#00FF00', // Green
    MISSED: '#FF0000', // Red
    TYPO: '#FFA500', // Orange
    HIT_ZONE: '#00FFFF', // Cyan
  },
  TIMING_WINDOWS: {
    SYNC: 0.05, // +/- 50ms for "Sync"
    LATE_EARLY: 0.15, // +/- 150ms for "Late" or "Early"
  },
  SCORING: {
    SYNC: 100,
    LATE_EARLY: 50,
    TYPO: -25,
    OFF: -50,
  },
}

/**
 * Canvas dimensions matching POC HTML
 */
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 150

/**
 * Convert screen coordinates to 3D world coordinates
 * A wide world space (16 units) to accommodate faster notes and create a bigger feel.
 */
function screenToWorld(screenX: number, screenY: number) {
  const worldX = (screenX / CANVAS_WIDTH) * 16 - 8
  const worldY = -(screenY / CANVAS_HEIGHT) * 3 + 1.5
  return { x: worldX, y: worldY, z: 0 }
}

/**
 * Convert world coordinates back to screen coordinates
 */
function worldToScreen(worldX: number, worldY: number) {
  const screenX = (worldX + 8) * (CANVAS_WIDTH / 16)
  const screenY = (-worldY + 1.5) * (CANVAS_HEIGHT / 3)
  return { x: screenX, y: screenY }
}

/**
 * Glass particle component for break animation
 */
interface GlassParticleProps {
  position: [number, number, number]
  velocity: [number, number, number]
  startTime: number
  size: number
  rotationSpeed: [number, number, number]
  color: string
  isFireParticle?: boolean // For typo particles with fire-like physics
}

function GlassParticle({
  position,
  velocity,
  startTime,
  size,
  rotationSpeed,
  color,
  isFireParticle = false,
}: GlassParticleProps) {
  const particleRef = useRef<THREE.Group>(null)
  const velocityRef = useRef<[number, number, number]>([...velocity])
  const prevTimeRef = useRef<number>(Date.now())

  useFrame(() => {
    if (!particleRef.current) return

    const now = Date.now()
    const delta = (now - prevTimeRef.current) / 1000 // seconds since last frame
    prevTimeRef.current = now

    // Physics constants
    const gravity = isFireParticle ? -2.0 : -9.81 // Fire particles have less gravity
    const groundY = -3.0 // Ground level - matches UI container height
    const leftWallX = -7.95 // Left wall position (slightly inward from container edge)
    const bounceDamping = 0.4 // More realistic energy loss on bounce
    const friction = isFireParticle ? 0.98 : 0.995 // Fire particles have more air resistance

    // Update velocity with gravity
    const v = velocityRef.current
    v[1] += gravity * delta
    v[0] *= friction
    v[2] *= friction

    // Fire particles fade upward instead of falling
    if (isFireParticle) {
      // Fire particles lose horizontal velocity and rise
      v[0] *= 0.95 // Horizontal damping
      v[2] *= 0.95 // Z damping
    }

    // Update position
    let x = particleRef.current.position.x + v[0] * delta
    let y = particleRef.current.position.y + v[1] * delta
    const z = particleRef.current.position.z + v[2] * delta

    // Bounce on ground with more realistic physics
    if (y <= groundY) {
      y = groundY
      if (Math.abs(v[1]) > 0.3) {
        v[1] = -v[1] * bounceDamping
      } else {
        v[1] = 0 // settle
        v[0] *= 0.9 // Add ground friction
        v[2] *= 0.9
      }
    }

    // Bounce off left wall
    if (x <= leftWallX) {
      x = leftWallX
      if (Math.abs(v[0]) > 0.2) {
        v[0] = -v[0] * bounceDamping // Reverse horizontal velocity with damping
      } else {
        v[0] = 0 // settle against wall
      }
    }

    particleRef.current.position.set(x, y, z)

    // Realistic tumbling rotation
    particleRef.current.rotation.x += rotationSpeed[0] * delta * 0.8
    particleRef.current.rotation.y += rotationSpeed[1] * delta * 0.8
    particleRef.current.rotation.z += rotationSpeed[2] * delta * 0.8

    // Fade out over time
    const elapsed = (now - startTime) / 1000
    const fadeTime = 4.0
    const fadeStart = 2.0

    let opacity = 1.0
    if (elapsed > fadeStart) {
      const fadeProgress = (elapsed - fadeStart) / (fadeTime - fadeStart)
      opacity = Math.max(0, 1.0 - Math.pow(fadeProgress, 1.5))
    }

    // Update opacity for both border and main particle
    particleRef.current.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshBasicMaterial
        material.opacity = opacity
      }
    })

    // Only hide when completely transparent
    particleRef.current.visible = opacity > 0.01
  })

  // Calculate darker border color
  const borderColor = useMemo(() => {
    const baseColor = new THREE.Color(color)
    // Darken the color by 40% for the border
    return baseColor.clone().multiplyScalar(0.6)
  }, [color])

  return (
    <group ref={particleRef} position={position as any}>
      {/* Darker border (slightly larger) */}
      <mesh>
        <boxGeometry args={[size * 1.1, size * 1.1, size * 1.1]} />
        <meshBasicMaterial color={borderColor} transparent opacity={1.0} />
      </mesh>

      {/* Main particle body */}
      <mesh>
        <boxGeometry args={[size, size, size]} />
        <meshBasicMaterial color={color} transparent opacity={1.0} />
      </mesh>
    </group>
  )
}

/**
 * Individual keystroke note component with glass break animation
 */
interface KeystrokeNoteProps {
  keystroke: Keystroke
  gameTime: number
}

function KeystrokeNote({ keystroke, gameTime }: KeystrokeNoteProps) {
  const groupRef = useRef<THREE.Group>(null)
  const boxRef = useRef<THREE.Mesh>(null)
  const [isBreaking, setIsBreaking] = useState(false)
  const [breakStartTime, setBreakStartTime] = useState(0)
  const [fadeOpacity, setFadeOpacity] = useState(1.0)
  const [glassParticles, setGlassParticles] = useState<
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

  // Track previous state to detect state changes
  const prevStateRef = useRef(keystroke.state)

  // Create a unique identifier for this keystroke to prevent reuse issues
  const uniqueId = useMemo(
    () =>
      `${keystroke.startTime.toFixed(4)}-${keystroke.key}-${keystroke.type}-${Math.random().toString(36).substr(2, 9)}`,
    [keystroke.startTime, keystroke.key, keystroke.type],
  )

  // Determine display character
  const displayKey = useMemo(() => {
    switch (keystroke.key) {
      case '[Space]':
        return '▭' // More visible block symbol for space
      case '[Enter]':
        return '↵' // More visible curved arrow for enter
      default:
        return keystroke.key
    }
  }, [keystroke.key])

  // Determine colors based on state - amber default with gray border
  const boxColor = useMemo(() => {
    switch (keystroke.state) {
      case 'hit':
        return GAME_CONFIG.COLORS.HIT
      case 'missed':
        return GAME_CONFIG.COLORS.MISSED
      case 'typo':
        return GAME_CONFIG.COLORS.TYPO
      default:
        return 'rgb(252, 211, 77)' // Light amber color from project theme
    }
  }, [keystroke.state])

  const textColor = useMemo(() => {
    switch (keystroke.state) {
      case 'hit':
        return '#000000' // Black text on green
      case 'missed':
        return '#FFFFFF' // White text on red
      case 'typo':
        return '#000000' // Black text on orange
      default:
        return '#000000' // Black text on amber
    }
  }, [keystroke.state])

  // Check if we should start glass break animation
  useEffect(() => {
    // Detect state change from 'upcoming' to 'hit'
    const prevState = prevStateRef.current
    const currentState = keystroke.state

    console.log(
      `Keystroke ${uniqueId} state: ${prevState} -> ${currentState}, isBreaking: ${isBreaking}`,
    )

    if (
      prevState === 'upcoming' &&
      (currentState === 'hit' || currentState === 'missed' || currentState === 'typo') &&
      !isBreaking
    ) {
      console.log(
        '🎯 Starting glass break animation for keystroke:',
        uniqueId,
        'timing:',
        keystroke.timingAccuracy,
        'at time:',
        gameTime,
      )
      setIsBreaking(true)
      setBreakStartTime(Date.now())

      // Create glass particles based on timing accuracy
      const particles = []
      let numParticles: number
      let velocityMultiplier: number
      let sizeMultiplier: number
      let particleColor: string

      // Adjust particle effects based on timing accuracy
      switch (keystroke.timingAccuracy) {
        case 'sync':
          // Perfect timing: Powerful left-to-right projection
          numParticles = 8 + Math.floor(Math.random() * 4) // 8-12 particles (reduced further)
          velocityMultiplier = 2.0 // More explosive for powerful effect
          sizeMultiplier = 1.2 // Bigger particles
          particleColor = '#00ff88' // Bright green
          break
        case 'early':
        case 'late':
          // Good timing: Moderate particles
          numParticles = 6 + Math.floor(Math.random() * 3) // 6-9 particles (reduced by half)
          velocityMultiplier = 1.0 // Normal velocity
          sizeMultiplier = 0.8 // Smaller particles
          particleColor = '#ffaa00' // Orange/yellow
          break
        case 'miss':
        default:
          // Default case - will be overridden by typo/miss logic below
          numParticles = 0
          velocityMultiplier = 0
          sizeMultiplier = 0
          particleColor = '#ff4444'
          break
      }

      // Handle typo and miss states - fire-like animation
      if (currentState === 'typo' || currentState === 'missed') {
        numParticles = 8 + Math.floor(Math.random() * 4) // 8-12 particles
        velocityMultiplier = 1.5 // Moderate upward velocity for fire effect
        sizeMultiplier = 0.9 // Medium-sized particles
        particleColor = currentState === 'typo' ? '#ff4444' : '#ff6666' // Red for typo, lighter red for miss
      }

      // Override color for hidden notes
      if (keystroke.type === 'hidden') {
        particleColor = '#d8b4fe' // Purple for hidden notes
      }

      // Skip animation if no particles (missed hits)
      if (numParticles === 0) {
        console.log('🚫 No particles for missed hit, skipping animation for', uniqueId)
        return
      }

      for (let i = 0; i < numParticles; i++) {
        let particleVelocity: [number, number, number]

        // Spawn particles from around the key box edges instead of center
        const boxEdgeX = (Math.random() - 0.5) * 0.8 // Spawn from left/right edges of box
        const boxEdgeY = (Math.random() - 0.5) * 0.8 // Spawn from top/bottom edges of box
        const boxEdgeZ = 0.1 + Math.random() * 0.2 // Varied Z position

        const particlePosition: [number, number, number] = [boxEdgeX, boxEdgeY, boxEdgeZ]

        if (currentState === 'typo' || currentState === 'missed') {
          // Typo/Miss hits: Fire-like upward movement
          particleVelocity = [
            (Math.random() - 0.5) * 2 * velocityMultiplier, // Minimal horizontal spread
            (Math.random() * 4 + 2) * velocityMultiplier, // Strong upward velocity like fire
            (Math.random() - 0.5) * 1 * velocityMultiplier, // Minimal Z variation
          ]
        } else if (keystroke.timingAccuracy === 'sync') {
          // Sync hits: Powerful right-to-left projection with strong horizontal bias
          particleVelocity = [
            -(Math.random() * 8 + 4) * velocityMultiplier, // Strong leftward velocity (negative for left direction)
            (Math.random() * 3 + 1) * velocityMultiplier, // Moderate upward velocity
            (Math.random() - 0.5) * 2 * velocityMultiplier, // Less Z variation for more focused effect
          ]
        } else {
          // Early/Late hits: Normal omnidirectional spread
          particleVelocity = [
            (Math.random() - 0.5) * 6 * velocityMultiplier, // Normal bidirectional velocity
            (Math.random() * 4 + 1) * velocityMultiplier, // Upward bias
            (Math.random() - 0.5) * 3 * velocityMultiplier, // Normal Z variation
          ]
        }

        particles.push({
          id: i,
          position: particlePosition,
          velocity: particleVelocity,
          startTime: Date.now(), // Immediate start, no delay
          size: (0.08 + Math.random() * 0.12) * sizeMultiplier, // Timing-based size
          rotationSpeed: [
            (Math.random() - 0.5) * 8, // More varied rotation speeds
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
          ] as [number, number, number],
          color: particleColor,
          isFireParticle: currentState === 'typo' || currentState === 'missed', // Fire particles for typo/miss hits
        })
      }

      setGlassParticles(particles)
      console.log(
        '💥 Created',
        particles.length,
        'glass particles for',
        uniqueId,
        'with timing:',
        keystroke.timingAccuracy,
      )
    }

    // Update previous state ref
    prevStateRef.current = currentState
  }, [keystroke.state, keystroke.timingAccuracy, isBreaking, uniqueId, gameTime])

  // More conservative reset logic - only reset when note is far off screen AND animation is old
  useEffect(() => {
    const timeDifference = keystroke.startTime - gameTime
    const distance = timeDifference * GAME_CONFIG.NOTE_SPEED_PPS
    const screenX = GAME_CONFIG.HIT_ZONE_X + distance

    // Only reset if note is far off screen AND animation has been running for a while
    if (screenX < -400 && isBreaking) {
      const animationAge = (Date.now() - breakStartTime) / 1000
      if (animationAge > 6.0) {
        // Reset after 6 seconds (slightly longer than breakDuration)
        // Only reset after 6 seconds (slightly longer than breakDuration)
        console.log('🧹 Resetting animation state for very old off-screen note:', uniqueId)
        setIsBreaking(false)
        setGlassParticles([])
        setBreakStartTime(0)
      }
    }
  }, [gameTime, keystroke.startTime, uniqueId, isBreaking, breakStartTime])

  // Animate the note
  useFrame(() => {
    if (!groupRef.current) return

    // Get game state from parent context
    const { gameState } = useTypoSyncStore.getState()

    // Stop animation updates when game is paused
    if (gameState.isPaused) return

    // Calculate timing difference for horizontal movement (matching POC logic exactly)
    const timeDifference = keystroke.startTime - gameTime
    const distance = timeDifference * GAME_CONFIG.NOTE_SPEED_PPS

    // Calculate screen position (matching POC)
    const screenX = GAME_CONFIG.HIT_ZONE_X + distance
    const screenY = CANVAS_HEIGHT / 2 // Middle of canvas height

    // Convert to world coordinates
    const worldPos = screenToWorld(screenX, screenY)

    // Check if this keystroke should be permanently hidden (hit or missed)
    const shouldBeHidden = keystroke.state === 'hit' || keystroke.state === 'missed'

    if (isBreaking) {
      // Glass break animation: fade out main box and show particles
      const breakTime = (Date.now() - breakStartTime) / 1000
      const breakDuration = 5.0 // Reduced to 5 seconds total animation
      const fadeOutDuration = 0.5 // 500ms fade out

      console.log(
        `🔥 Glass break animation: breakTime=${breakTime.toFixed(3)}s, particles=${glassParticles.length}, id=${uniqueId}`,
      )

      // Only fade out for missed and typo keystrokes
      if (keystroke.state === 'missed' || keystroke.state === 'typo') {
        // Fade out the main box over fadeOutDuration
        const fadeProgress = Math.min(breakTime / fadeOutDuration, 1.0)
        const opacity = 1.0 - fadeProgress
        setFadeOpacity(opacity)

        // Keep visible during fade
        groupRef.current.visible = opacity > 0
      } else {
        // For hit keystrokes, hide immediately without fade
        groupRef.current.visible = false
      }

      if (breakTime >= breakDuration && glassParticles.length > 0) {
        setGlassParticles([]) // Clean up particles
        console.log('✅ Glass break animation completed, particles cleaned up for', uniqueId)
      }
    } else if (shouldBeHidden) {
      // If keystroke is hit or missed, hide it permanently (no animation)
      groupRef.current.visible = false
    } else {
      // Normal movement: horizontal scrolling (only for upcoming keystrokes)
      groupRef.current.position.x = worldPos.x
      groupRef.current.position.y = worldPos.y
      groupRef.current.position.z = 0
      groupRef.current.scale.setScalar(1)
      groupRef.current.rotation.set(0, 0, 0)
      groupRef.current.visible = true
      setFadeOpacity(1.0) // Reset opacity for normal state
    }
  })

  return (
    <>
      {/* Main letter box group */}
      <group ref={groupRef}>
        {/* Gray border frame */}
        <Box args={[0.9, 0.9, 0.08]}>
          <meshBasicMaterial color="#666666" transparent opacity={fadeOpacity} />
        </Box>

        {/* Amber letter box background - fade out when breaking */}
        <Box ref={boxRef} args={[0.8, 0.8, 0.1]}>
          <meshBasicMaterial color={boxColor} transparent opacity={fadeOpacity} />
        </Box>

        {/* Character text inside the box - fade out when breaking */}
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.4}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          font="/fonts/PressStart2P-Regular.ttf"
          outlineWidth={0.008}
          outlineColor="#FFFFFF"
          visible={fadeOpacity > 0}
        >
          {displayKey}
        </Text>
      </group>

      {/* Glass particles for break animation - enhanced with bigger sizes and variation */}
      {isBreaking &&
        glassParticles.map((particle) => {
          // Get the current position of the main box for particle spawning
          const currentPos = groupRef.current?.position || new THREE.Vector3(0, 0, 0)
          const particleWorldPos: [number, number, number] = [
            currentPos.x + particle.position[0],
            currentPos.y + particle.position[1],
            currentPos.z + particle.position[2],
          ]

          return (
            <GlassParticle
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

/**
 * Hit zone indicator with beat-synchronized rubber expansion using server beat timestamps
 */
interface HitZoneProps {
  keystrokeMap: Keystroke[]
  gameTime: number
  beatTimestamps: number[]
}

function HitZone({ keystrokeMap, gameTime, beatTimestamps }: HitZoneProps) {
  const lineRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!lineRef.current || !glowRef.current) return

    // Get game state from parent context
    const { gameState } = useTypoSyncStore.getState()

    // Stop animation updates when game is paused
    if (gameState.isPaused) return

    let rubberExpansion = 1.0
    let glowIntensity = 0.3

    // Check server beat timestamps for rubber expansion (use ALL beat timestamps, not keystrokeMap)
    for (const beatTime of beatTimestamps) {
      const timeDiff = Math.abs(gameTime - beatTime)

      // Trigger rubber expansion when we're close to any beat timestamp
      if (timeDiff <= 0.15) {
        // 150ms window around each beat
        console.log(
          `Rubber expansion triggered! timeDiff: ${timeDiff.toFixed(3)}, beatTime: ${beatTime.toFixed(3)}, gameTime: ${gameTime.toFixed(3)}`,
        )

        // Create rubber expansion effect based on how close we are to the beat
        const beatProgress = 1.0 - timeDiff / 0.15 // 1.0 = perfect timing, 0.0 = edge of window

        // Use a sine wave for smooth rubber expansion
        const expansionPhase = (Date.now() % 400) / 400 // 400ms cycle
        const sineWave = Math.sin(expansionPhase * Math.PI * 2)

        // Scale expansion based on timing accuracy
        rubberExpansion = 1.0 + sineWave * 0.4 * beatProgress // Up to 40% expansion for perfect timing
        glowIntensity = 0.3 + beatProgress * 0.6 // Up to 90% glow for perfect timing
        break
      }
    }

    // Apply rubber expansion (height only)
    lineRef.current.scale.set(1.0, rubberExpansion, 1.0)

    // Update glow material
    const glowMaterial = glowRef.current.material as THREE.MeshBasicMaterial
    glowMaterial.opacity = glowIntensity
  })

  // Convert hit zone screen position to world coordinates
  const hitZoneWorldPos = screenToWorld(GAME_CONFIG.HIT_ZONE_X, CANVAS_HEIGHT / 2)

  return (
    <group position={[hitZoneWorldPos.x, 0, 0]}>
      {/* Main hit zone - clean minimal bar */}
      <group ref={lineRef}>
        {/* Main central bar - softer amber */}
        <mesh ref={glowRef}>
          <planeGeometry args={[0.25, 4.8]} />
          <meshBasicMaterial color="#d4a574" transparent opacity={0.8} />
        </mesh>

        {/* Pixel art style borders - softer dark color */}
        <mesh position={[-0.15, 0, 0.01]}>
          <planeGeometry args={[0.05, 4.8]} />
          <meshBasicMaterial color="#4a4a4a" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0.15, 0, 0.01]}>
          <planeGeometry args={[0.05, 4.8]} />
          <meshBasicMaterial color="#4a4a4a" transparent opacity={0.7} />
        </mesh>

        {/* Top and bottom borders */}
        <mesh position={[0, 2.4, 0.01]}>
          <planeGeometry args={[0.35, 0.05]} />
          <meshBasicMaterial color="#4a4a4a" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, -2.4, 0.01]}>
          <planeGeometry args={[0.35, 0.05]} />
          <meshBasicMaterial color="#4a4a4a" transparent opacity={0.7} />
        </mesh>

        {/* Inner highlight for 3D effect - softer colors */}
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

/**
 * Background gradient effect component
 */
interface BackgroundEffectProps {
  keystrokeMap: Keystroke[]
  gameTime: number
  gameState: any
}

function BackgroundEffect({ keystrokeMap, gameTime, gameState }: BackgroundEffectProps) {
  const bgRef = useRef<THREE.Mesh>(null)
  const [lastHitTime, setLastHitTime] = useState(0)
  const [lastHitType, setLastHitType] = useState<'sync' | 'late' | 'early' | null>(null)

  useFrame(() => {
    if (!bgRef.current) return

    // Get game state from parent context
    const { gameState } = useTypoSyncStore.getState()

    // Stop animation updates when game is paused
    if (gameState.isPaused) return

    // Check for recent hits with different timing accuracy
    let syncEffect = 0
    let lateEarlyEffect = 0

    // Check for perfect sync hits
    const recentSyncHits = keystrokeMap.filter(
      (k) => k.state === 'hit' && Math.abs(gameTime - k.startTime) <= 0.05, // Perfect sync window
    )

    // Check for late/early hits
    const recentLateEarlyHits = keystrokeMap.filter(
      (k) =>
        k.state === 'hit' &&
        Math.abs(gameTime - k.startTime) > 0.05 &&
        Math.abs(gameTime - k.startTime) <= 0.15, // Late/early window
    )

    if (recentSyncHits.length > 0) {
      const timeSinceHit = Math.min(...recentSyncHits.map((k) => Math.abs(gameTime - k.startTime)))
      const effectDuration = 3.0 // Much slower: 3 seconds effect
      const effectProgress = timeSinceHit / effectDuration

      if (effectProgress < 1.0) {
        // Much smoother curve with gentler easing
        const easedProgress = 1.0 - Math.pow(effectProgress, 3) // Cubic easing for smoother transition
        syncEffect = easedProgress * 0.4 // Reduced intensity for subtlety
        setLastHitTime(gameTime)
        setLastHitType('sync')
      }
    } else if (recentLateEarlyHits.length > 0) {
      const timeSinceHit = Math.min(
        ...recentLateEarlyHits.map((k) => Math.abs(gameTime - k.startTime)),
      )
      const effectDuration = 1.5 // Slower duration for late/early
      const effectProgress = timeSinceHit / effectDuration

      if (effectProgress < 1.0) {
        // Smoother effect for late/early hits
        const easedProgress = 1.0 - Math.pow(effectProgress, 3)
        lateEarlyEffect = easedProgress * 0.15 // Reduced effect
        setLastHitTime(gameTime)
        setLastHitType('late')
      }
    }

    // Calculate wave progress for left-to-right effect - much slower
    const waveProgress = lastHitTime > 0 ? (gameTime - lastHitTime) * 0.8 : 0 // Slower wave speed

    // Update background material
    const material = bgRef.current.material as THREE.ShaderMaterial
    material.uniforms.syncEffect.value = syncEffect
    material.uniforms.lateEarlyEffect.value = lateEarlyEffect
    material.uniforms.waveProgress.value = waveProgress
    material.uniforms.time.value = Date.now() * 0.0005 // Slower time progression for smoother animation
  })

  // Custom shader for gradient background effect
  const backgroundMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        syncEffect: { value: 0.0 },
        lateEarlyEffect: { value: 0.0 },
        waveProgress: { value: 0.0 },
        time: { value: 0.0 },
        hitZoneX: { value: screenToWorld(GAME_CONFIG.HIT_ZONE_X, CANVAS_HEIGHT / 2).x },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float syncEffect;
        uniform float lateEarlyEffect;
        uniform float waveProgress;
        uniform float time;
        uniform float hitZoneX;
        varying vec2 vUv;
        
        void main() {
          // Base grey-white gradient background
          vec3 baseColor = mix(
            vec3(0.88, 0.88, 0.88), // Slightly darker grey
            vec3(0.96, 0.96, 0.96), // Near white
            smoothstep(0.0, 1.0, vUv.y) // Smoother gradient transition
          );
          
          // Left-to-right wave effect for sync hits - much smoother and darker green
          if (syncEffect > 0.0) {
            // Slower wave that travels much further to the right
            float waveX = waveProgress * 1.2; // slower movement
            float distanceFromWave = abs(vUv.x - waveX);
            
            // Much smoother wave with gentler falloff, expanded area
            float waveIntensity = syncEffect * exp(-distanceFromWave * 2.0); // Even gentler falloff for wider spread
            waveIntensity = smoothstep(0.0, 1.0, waveIntensity);
            
            // Darker, richer green gradient for sync hits
            vec3 syncGradient = vec3(0.0, waveIntensity * 0.7, waveIntensity * 0.25);
            baseColor = mix(baseColor, baseColor + syncGradient, waveIntensity);
          }
          
          // Smoother, expanded effect for late/early hits around hit zone
          if (lateEarlyEffect > 0.0) {
            float hitZoneUV = 0.1; // Hit zone position
            float distanceFromHitZone = abs(vUv.x - hitZoneUV);
            
            // Much wider area effect for late/early, expanding to the right
            float lateEarlyIntensity = lateEarlyEffect * exp(-distanceFromHitZone * 4.0); // Much wider spread
            lateEarlyIntensity = smoothstep(0.0, 1.0, lateEarlyIntensity);
            
            // Darker yellow/orange gradient for late/early hits
            vec3 lateEarlyGradient = vec3(lateEarlyIntensity * 0.4, lateEarlyIntensity * 0.3, 0.0); // Darker colors
            baseColor = mix(baseColor, baseColor + lateEarlyGradient, lateEarlyIntensity);
          }
          
          gl_FragColor = vec4(baseColor, 1.0);
        }
      `,
    })
  }, [])

  return (
    <mesh ref={bgRef} position={[0, 0, -5]}>
      <planeGeometry args={[20, 10]} />
      <primitive object={backgroundMaterial} />
    </mesh>
  )
}

/**
 * Hidden note burst component
 */
interface HiddenBurstProps {
  note: Keystroke
  gameTime: number
}
function HiddenNoteBurst({ note, gameTime }: HiddenBurstProps) {
  const [particles] = useState(() => {
    const parts = []
    const num = 12 // Reduced from 20 to 12 particles
    const hitZoneWorld = screenToWorld(GAME_CONFIG.HIT_ZONE_X, CANVAS_HEIGHT / 2)

    for (let i = 0; i < num; i++) {
      parts.push({
        id: i,
        // Spread particles across the height of the hit zone
        position: [
          hitZoneWorld.x + (Math.random() - 0.5) * 0.4, // Small horizontal spread around hit zone
          hitZoneWorld.y + (Math.random() - 0.5) * 4.0, // Spread across hit zone height (~4 units)
          0.1 + Math.random() * 0.2, // Varied Z position
        ] as [number, number, number],
        velocity: [
          (Math.random() - 0.5) * 3, // Reduced projection power: omnidirectional around hit zone
          Math.random() * 1.5 + 0.5, // Reduced upward velocity: gentle rise then drop
          (Math.random() - 0.5) * 1.5, // Reduced Z velocity
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
        <GlassParticle
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

/**
 * Game scene component that contains all 3D elements
 */
interface GameSceneProps {
  keystrokeMap: Keystroke[]
  gameTime: number
  gameState: any
  beatTimestamps: number[]
}

function GameScene({ keystrokeMap, gameTime, gameState, beatTimestamps }: GameSceneProps) {
  // Filter visible keystrokes (within canvas bounds with buffer)
  // IMPORTANT: Hidden notes should NOT be rendered as visible key boxes
  const visibleKeystrokes = useMemo(() => {
    const visible = keystrokeMap.filter((keystroke) => {
      // Filter out hidden notes - they should be completely invisible
      if (keystroke.type === 'hidden') {
        return false
      }

      const timeDifference = keystroke.startTime - gameTime
      const distance = timeDifference * GAME_CONFIG.NOTE_SPEED_PPS
      const screenX = GAME_CONFIG.HIT_ZONE_X + distance

      // Keep recently hit keystrokes alive for the full break animation even if off-screen
      if (keystroke.state === 'hit') {
        const timeSinceHit = gameTime - keystroke.startTime
        return timeSinceHit <= 6.0 // Allow rendering for full animation
      }

      // For upcoming or missed notes, only render if within view buffer
      const isVisible = screenX > -100 && screenX < CANVAS_WIDTH + 100
      return isVisible
    })

    // Debug logging every few frames
    if (Math.floor(gameTime * 10) % 30 === 0) {
      // Log every 3 seconds
      const hiddenNotes = keystrokeMap.filter((k) => k.type === 'hidden')
      const regularKeys = keystrokeMap.filter((k) => k.type !== 'hidden')

      console.log('🎮 Visibility check:', {
        gameTime: gameTime.toFixed(2),
        totalKeystrokes: keystrokeMap.length,
        regularKeys: regularKeys.length,
        hiddenNotes: hiddenNotes.length,
        visibleRendered: visible.length,
        upcomingVisible: visible.filter((k) => k.state === 'upcoming').length,
        upcomingHidden: hiddenNotes.filter((k) => k.state === 'upcoming').length,
        nextKeystroke: keystrokeMap.find((k) => k.state === 'upcoming'),
      })
    }

    return visible
  }, [keystrokeMap, gameTime])

  // Debug logging for beat timestamps
  useEffect(() => {
    console.log('Server beat timestamps (first 10):', beatTimestamps.slice(0, 10)) // Log first 10 beats
    console.log('Total beat timestamps:', beatTimestamps.length)
    console.log('Current game time:', gameTime)

    // Check for hit keystrokes
    const hitKeystrokes = keystrokeMap.filter((k) => k.state === 'hit')
    if (hitKeystrokes.length > 0) {
      console.log('Hit keystrokes detected:', hitKeystrokes)
    }
  }, [beatTimestamps, gameTime, keystrokeMap])

  return (
    <>
      {/* Enhanced lighting for better box visibility */}
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 0, 5]} intensity={0.6} />

      {/* Background with sync effect */}
      <BackgroundEffect keystrokeMap={keystrokeMap} gameTime={gameTime} gameState={gameState} />

      {/* Invisible left wall for particle bouncing - at the very edge of the game container */}
      <mesh position={[-8, 0, 0]}>
        <boxGeometry args={[0.1, 6, 0.5]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.0} />
      </mesh>

      {/* Hit zone with beat-synchronized rubber expansion using server beat timestamps */}
      <HitZone keystrokeMap={keystrokeMap} gameTime={gameTime} beatTimestamps={beatTimestamps} />

      {/* Keystroke notes - now with glass break animation and unique keys */}
      {visibleKeystrokes.map((keystroke) => (
        <KeystrokeNote
          key={`${keystroke.startTime.toFixed(4)}-${keystroke.key}-${keystroke.type}`}
          keystroke={keystroke}
          gameTime={gameTime}
        />
      ))}

      {/* Hidden note bursts - now unified in keystrokeMap */}
      {useMemo(() => {
        return keystrokeMap
          .filter((k) => k.type === 'hidden' && k.state === 'hit')
          .map((note) => {
            console.log(
              `🟣 Rendering HiddenNoteBurst for hidden note at ${note.startTime.toFixed(2)}s`,
            )
            return (
              <HiddenNoteBurst
                key={`burst-hidden-${note.startTime}`}
                note={note}
                gameTime={gameTime}
              />
            )
          })
      }, [keystrokeMap, gameTime])}
    </>
  )
}

/**
 * Main Three.js game renderer component
 */
export default function ThreeGameRenderer({
  gameConfig,
  onKeystrokeUpdate,
}: Omit<ThreeGameRendererProps, 'keystrokeMap' | 'gameState' | 'analysisResult'>) {
  // Use Zustand store directly
  const { gameState, audioState } = useTypoSyncStore()
  const { keystrokeMap, analysisResult } = audioState

  const [gameTime, setGameTime] = useState(0)

  // Debug logging for keystroke map changes
  useEffect(() => {
    const hiddenNotes = keystrokeMap.filter((k) => k.type === 'hidden')
    const regularKeys = keystrokeMap.filter((k) => k.type !== 'hidden')

    console.log('🎮 GameRenderer: keystrokeMap updated', {
      totalItems: keystrokeMap.length,
      regularKeys: regularKeys.length,
      hiddenNotes: hiddenNotes.length,
      upcomingRegular: regularKeys.filter((k) => k.state === 'upcoming').length,
      upcomingHidden: hiddenNotes.filter((k) => k.state === 'upcoming').length,
      hitCount: keystrokeMap.filter((k) => k.state === 'hit').length,
      missedCount: keystrokeMap.filter((k) => k.state === 'missed').length,
      gameActive: gameState.isActive,
    })
  }, [keystrokeMap, gameState.isActive])

  // Debug logging for hidden notes in keystrokeMap
  useEffect(() => {
    const hiddenNotes = keystrokeMap.filter((k) => k.type === 'hidden')
    console.log('🟣 GameRenderer: unified keystrokeMap hidden notes', {
      totalHiddenNotes: hiddenNotes.length,
      upcomingHiddenNotes: hiddenNotes.filter((h) => h.state === 'upcoming').length,
      hitHiddenNotes: hiddenNotes.filter((h) => h.state === 'hit').length,
      firstFewHiddenNotes: hiddenNotes
        .slice(0, 3)
        .map((h) => ({ time: h.startTime.toFixed(3), state: h.state })),
    })
  }, [keystrokeMap])

  // Get beat timestamps from analysisResult prop
  const beatTimestamps = useMemo(() => {
    // First, try to get beat timestamps from analysisResult prop
    if (
      analysisResult &&
      analysisResult.beat_timestamps &&
      analysisResult.beat_timestamps.length > 0
    ) {
      console.log(
        '✅ Using beat timestamps from analysisResult:',
        analysisResult.beat_timestamps.length,
      )
      return analysisResult.beat_timestamps
    }

    // Fallback: extract beat timestamps from keystrokeMap
    const fallbackTimestamps = keystrokeMap
      .filter((k) => k.type === 'beat')
      .map((k) => k.startTime)
      .sort((a, b) => a - b)

    if (fallbackTimestamps.length > 0) {
      console.log(
        '⚠️ Fallback: Using beat timestamps from keystrokeMap:',
        fallbackTimestamps.length,
      )
      return fallbackTimestamps
    }

    // Ultimate fallback: generate some basic beat timestamps based on game time
    // This ensures the game can still work even without proper beat analysis
    const basicBeats = []
    for (let i = 0; i < 120; i += 0.5) {
      // Beat every 0.5 seconds for 1 minute
      basicBeats.push(i)
    }
    console.log('🚨 Ultimate fallback: Using generated beat timestamps:', basicBeats.length)
    return basicBeats
  }, [analysisResult, keystrokeMap])

  // Update game time based on game state with optimized performance
  useEffect(() => {
    if (!gameState.isActive || !gameState.gameStartTime) {
      setGameTime(0)
      return
    }

    let animationId: number

    const updateTime = () => {
      // Don't update time when paused
      if (!gameState.isPaused) {
        const currentTime = performance.now() / 1000 // Convert to seconds to match keystroke timestamps
        const totalGameTime = currentTime - gameState.gameStartTime! / 1000 // gameStartTime is in ms, convert to seconds

        // Calculate pause time adjustment
        const pauseTime =
          gameState.isPaused && gameState.pauseStartTime
            ? currentTime - gameState.pauseStartTime / 1000
            : 0
        const effectiveGameTime = totalGameTime - gameState.totalPauseTime / 1000 - pauseTime

        setGameTime(Math.max(0, effectiveGameTime))
      }

      // Use requestAnimationFrame for smoother performance
      animationId = requestAnimationFrame(updateTime)
    }

    updateTime()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [
    gameState.isActive,
    gameState.gameStartTime,
    gameState.isPaused,
    gameState.pauseStartTime,
    gameState.totalPauseTime,
  ])

  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-b from-background to-card overflow-hidden">
      {/* Canvas Container - This contains the 3D game and its overlays */}
      <div className="relative w-full h-full">
        <Canvas
          orthographic={true} // Enable orthographic projection
          camera={{
            left: -8,
            right: 8,
            top: 3,
            bottom: -3,
            position: [3, 0, 8],
            near: 0.1,
            far: 1000,
          }}
          gl={{
            antialias: true, // Enable antialiasing for better text rendering
            alpha: false,
            powerPreference: 'high-performance', // Optimize for performance
            stencil: false, // Disable stencil buffer for better performance
            depth: true, // Enable depth testing for proper 3D rendering
            premultipliedAlpha: false, // Better color accuracy
          }}
          dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1} // Better text sharpness
          frameloop="always" // Always render for smooth animations
          performance={{ min: 0.8 }} // Maintain 60 FPS target
        >
          {/* Game scene with background effect and beat timestamps */}
          <GameScene
            keystrokeMap={keystrokeMap}
            gameTime={gameTime}
            gameState={gameState}
            beatTimestamps={beatTimestamps}
          />
        </Canvas>

        {/* Progress Bar - Top of Canvas */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-background/80 backdrop-blur-sm border-b-2 border-border/50">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-300 pixel-border relative overflow-hidden"
            style={{
              width: `${Math.min(
                keystrokeMap.length > 0
                  ? (keystrokeMap.filter(
                      (k) => k.state === 'hit' || k.state === 'missed' || k.state === 'typo',
                    ).length /
                      keystrokeMap.filter((k) => k.type !== 'hidden').length) *
                      100
                  : 0,
                100,
              )}%`,
            }}
            animate={{
              boxShadow:
                keystrokeMap.length > 0 &&
                keystrokeMap.filter(
                  (k) => k.state === 'hit' || k.state === 'missed' || k.state === 'typo',
                ).length /
                  keystrokeMap.filter((k) => k.type !== 'hidden').length >
                  0.8
                  ? ['0 0 0px #b58900', '0 0 8px #b58900', '0 0 0px #b58900']
                  : '0 0 0px #b58900',
            }}
            transition={{
              duration: 1,
              repeat:
                keystrokeMap.length > 0 &&
                keystrokeMap.filter(
                  (k) => k.state === 'hit' || k.state === 'missed' || k.state === 'typo',
                ).length /
                  keystrokeMap.filter((k) => k.type !== 'hidden').length >
                  0.8
                  ? Infinity
                  : 0,
            }}
          >
            {/* Ember particles */}
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-orange-400 rounded-full opacity-80"
                animate={{
                  x: [0, 20, 0],
                  y: [-2, -8, -2],
                  opacity: [0.8, 0.3, 0.8],
                  scale: [1, 0.5, 1],
                }}
                transition={{
                  duration: 0.8 + i * 0.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.3,
                }}
                style={{
                  right: `${10 + i * 15}%`,
                  top: '50%',
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Main Game Stats - Top Center Row */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-3 pointer-events-none max-h-22">
          {/* Score */}
          <motion.div
            className={`
              backdrop-blur-sm border-2 px-4 py-2 min-w-[100px] pointer-events-auto shadow-[4px_4px_0px_#000] pixel-border
              ${(() => {
                const totalNotes = keystrokeMap.filter((k) => k.type !== 'hidden').length
                const syncHits = keystrokeMap.filter(
                  (k) => k.state === 'hit' && k.timingAccuracy === 'sync',
                ).length
                const syncPercentage = totalNotes > 0 ? (syncHits / totalNotes) * 100 : 0

                if (syncPercentage >= 99) return 'bg-violet-900/90 border-violet-700' // Perfect
                if (syncPercentage >= 90) return 'bg-indigo-900/90 border-indigo-700' // High Distinction
                if (syncPercentage >= 75) return 'bg-blue-900/90 border-blue-700' // Distinction
                if (syncPercentage >= 50) return 'bg-emerald-900/90 border-emerald-700' // Good
                return 'bg-background/85 border-border/50' // Default
              })()}
            `}
            animate={{
              scale: gameState.score > 0 && gameState.score % 100 === 0 ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="text-center">
              <RollingNumber
                value={gameState.score}
                className={`
                    text-2xl font-['Press_Start_2P']
                    ${(() => {
                      const totalNotes = keystrokeMap.filter((k) => k.type !== 'hidden').length
                      const syncHits = keystrokeMap.filter(
                        (k) => k.state === 'hit' && k.timingAccuracy === 'sync',
                      ).length
                      const syncPercentage = totalNotes > 0 ? (syncHits / totalNotes) * 100 : 0

                      if (syncPercentage >= 99) return 'text-violet-200'
                      if (syncPercentage >= 90) return 'text-indigo-200'
                      if (syncPercentage >= 75) return 'text-blue-200'
                      if (syncPercentage >= 50) return 'text-emerald-200'
                      if (gameState.score < 0) return 'text-red-400'
                      return 'text-amber-700'
                    })()}
                  `}
                duration={0.12}
              />
              <div
                className={`
                text-xs mt-[-24]
                ${(() => {
                  const totalNotes = keystrokeMap.filter((k) => k.type !== 'hidden').length
                  const syncHits = keystrokeMap.filter(
                    (k) => k.state === 'hit' && k.timingAccuracy === 'sync',
                  ).length
                  const syncPercentage = totalNotes > 0 ? (syncHits / totalNotes) * 100 : 0
                  return syncPercentage >= 50 ? 'text-white/80' : 'text-text/60'
                })()}
              `}
              >
                SCORE
              </div>
            </div>
          </motion.div>

          {/* WPM */}
          <motion.div
            className={`
              backdrop-blur-sm border-2 px-4 py-2 min-w-[100px] pointer-events-auto shadow-[4px_4px_0px_#000] pixel-border
              ${(() => {
                if (gameState.wpm >= 60) return 'bg-violet-900/90 border-violet-700' // Perfect
                if (gameState.wpm >= 45) return 'bg-indigo-900/90 border-indigo-700' // High Distinction
                if (gameState.wpm >= 30) return 'bg-blue-900/90 border-blue-700' // Distinction
                if (gameState.wpm >= 20) return 'bg-emerald-900/90 border-emerald-700' // Good
                return 'bg-background/85 border-border/50' // Default
              })()}
            `}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <motion.div
                animate={{
                  textShadow: gameState.wpm >= 60 ? '0 0 6px currentColor' : 'none',
                }}
              >
                <RollingNumber
                  value={gameState.wpm}
                  className={`
                      text-2xl font-['Press_Start_2P']
                      ${(() => {
                        if (gameState.wpm >= 60) return 'text-violet-200'
                        if (gameState.wpm >= 45) return 'text-indigo-200'
                        if (gameState.wpm >= 30) return 'text-blue-200'
                        if (gameState.wpm >= 20) return 'text-emerald-200'
                        return 'text-amber-700'
                      })()}
                    `}
                  duration={0.12}
                />
              </motion.div>
              <div
                className={`
                text-xs mt-[-24]
                ${(() => {
                  return gameState.wpm >= 20 ? 'text-white/80' : 'text-text/60'
                })()}
              `}
              >
                WPM
              </div>
            </div>
          </motion.div>

          {/* Accuracy */}
          <motion.div
            className={`
              backdrop-blur-sm border-2 px-4 py-2 min-w-[100px] pointer-events-auto shadow-[4px_4px_0px_#000] pixel-border
              ${(() => {
                if (gameState.accuracy >= 99) return 'bg-violet-900/90 border-violet-700' // Perfect
                if (gameState.accuracy >= 90) return 'bg-indigo-900/90 border-indigo-700' // High Distinction
                if (gameState.accuracy >= 75) return 'bg-blue-900/90 border-blue-700' // Distinction
                if (gameState.accuracy >= 50) return 'bg-emerald-900/90 border-emerald-700' // Good
                return 'bg-background/85 border-border/50' // Default
              })()}
            `}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <div className="flex items-center justify-center">
                <RollingNumber
                  value={gameState.accuracy}
                  className={`
                      text-2xl font-['Press_Start_2P']
                      ${(() => {
                        if (gameState.accuracy >= 99) return 'text-violet-200'
                        if (gameState.accuracy >= 90) return 'text-indigo-200'
                        if (gameState.accuracy >= 75) return 'text-blue-200'
                        if (gameState.accuracy >= 50) return 'text-emerald-200'
                        return 'text-red-400'
                      })()}
                    `}
                  duration={0.12}
                />
                <span
                  className={`
                    text-sm font-['Press_Start_2P'] ml-1 opacity-70
                    ${(() => {
                      if (gameState.accuracy >= 99) return 'text-violet-200'
                      if (gameState.accuracy >= 90) return 'text-indigo-200'
                      if (gameState.accuracy >= 75) return 'text-blue-200'
                      if (gameState.accuracy >= 50) return 'text-emerald-200'
                      return 'text-red-400'
                    })()}
                  `}
                >
                  %
                </span>
              </div>
              <div
                className={`
                text-xs mt-[-24]
                ${(() => {
                  return gameState.accuracy >= 50 ? 'text-white/80' : 'text-text/60'
                })()}
              `}
              >
                ACCURACY
              </div>
            </div>
          </motion.div>
        </div>

        {/* Streak - Top Right with Dynamic Background */}
        <div className="absolute top-4 right-4 pointer-events-none">
          <motion.div
            className={`
              backdrop-blur-sm border-2 px-4 py-2 min-w-[100px] pointer-events-auto
              shadow-[4px_4px_0px_#000] pixel-border
              ${(() => {
                const totalNotes = keystrokeMap.filter((k) => k.type !== 'hidden').length
                const streakPercentage = totalNotes > 0 ? (gameState.streak / totalNotes) * 100 : 0

                if (streakPercentage >= 90) return 'bg-red-900/90 border-red-800 animate-pulse' // Final - Red
                if (streakPercentage >= 75) return 'bg-orange-900/90 border-orange-800' // Second - Orange
                if (streakPercentage >= 50) return 'bg-amber-900/90 border-amber-800' // 50%
                if (streakPercentage >= 30) return 'bg-yellow-900/90 border-yellow-800' // 30%
                if (streakPercentage >= 15) return 'bg-lime-900/90 border-lime-800' // 15%
                if (streakPercentage >= 5) return 'bg-green-900/90 border-green-800' // Base 5%
                return 'bg-background/85 border-border/50' // Default
              })()}
            `}
            animate={{
              scale: (() => {
                const totalNotes = keystrokeMap.filter((k) => k.type !== 'hidden').length
                const streakPercentage = totalNotes > 0 ? (gameState.streak / totalNotes) * 100 : 0
                return streakPercentage >= 90 ? [1, 1.05, 1] : 1
              })(),
              boxShadow: (() => {
                const totalNotes = keystrokeMap.filter((k) => k.type !== 'hidden').length
                const streakPercentage = totalNotes > 0 ? (gameState.streak / totalNotes) * 100 : 0
                return streakPercentage >= 90
                  ? ['4px_4px_0px_#000', '6px_6px_0px_#000', '4px_4px_0px_#000']
                  : '4px_4px_0px_#000'
              })(),
            }}
            transition={{
              duration: (() => {
                const totalNotes = keystrokeMap.filter((k) => k.type !== 'hidden').length
                const streakPercentage = totalNotes > 0 ? (gameState.streak / totalNotes) * 100 : 0
                return streakPercentage >= 90 ? 0.5 : 0.3
              })(),
              repeat: (() => {
                const totalNotes = keystrokeMap.filter((k) => k.type !== 'hidden').length
                const streakPercentage = totalNotes > 0 ? (gameState.streak / totalNotes) * 100 : 0
                return streakPercentage >= 90 ? Infinity : 0
              })(),
              ease: 'easeInOut',
            }}
          >
            <div className="text-center">
              <motion.div
                className="flex items-center justify-center"
                animate={{
                  textShadow: (() => {
                    const totalNotes = keystrokeMap.filter((k) => k.type !== 'hidden').length
                    const streakPercentage =
                      totalNotes > 0 ? (gameState.streak / totalNotes) * 100 : 0
                    return streakPercentage >= 90
                      ? ['0 0 0px currentColor', '0 0 6px currentColor', '0 0 0px currentColor']
                      : 'none'
                  })(),
                }}
                transition={{
                  duration: 0.5,
                  repeat: (() => {
                    const totalNotes = keystrokeMap.filter((k) => k.type !== 'hidden').length
                    const streakPercentage =
                      totalNotes > 0 ? (gameState.streak / totalNotes) * 100 : 0
                    return streakPercentage >= 90 ? Infinity : 0
                  })(),
                }}
              >
                <RollingNumber
                  value={gameState.streak}
                  className={`
                        text-2xl font-['Press_Start_2P']
                        ${(() => {
                          const totalNotes = keystrokeMap.filter((k) => k.type !== 'hidden').length
                          const streakPercentage =
                            totalNotes > 0 ? (gameState.streak / totalNotes) * 100 : 0

                          if (streakPercentage >= 90) return 'text-red-200'
                          if (streakPercentage >= 75) return 'text-orange-200'
                          if (streakPercentage >= 50) return 'text-amber-200'
                          if (streakPercentage >= 30) return 'text-yellow-200'
                          if (streakPercentage >= 15) return 'text-lime-200'
                          if (streakPercentage >= 5) return 'text-green-200'
                          return 'text-gray-400'
                        })()}
                      `}
                  duration={0.12}
                />
                <span
                  className={`
                      text-sm font-['Press_Start_2P'] ml-1 opacity-80
                      ${(() => {
                        const totalNotes = keystrokeMap.filter((k) => k.type !== 'hidden').length
                        const streakPercentage =
                          totalNotes > 0 ? (gameState.streak / totalNotes) * 100 : 0

                        if (streakPercentage >= 90) return 'text-red-200'
                        if (streakPercentage >= 75) return 'text-orange-200'
                        if (streakPercentage >= 50) return 'text-amber-200'
                        if (streakPercentage >= 30) return 'text-yellow-200'
                        if (streakPercentage >= 15) return 'text-lime-200'
                        if (streakPercentage >= 5) return 'text-green-200'
                        return 'text-gray-400'
                      })()}
                    `}
                >
                  {(() => {
                    const totalNotes = keystrokeMap.filter((k) => k.type !== 'hidden').length
                    const streakPercentage =
                      totalNotes > 0 ? (gameState.streak / totalNotes) * 100 : 0
                    if (streakPercentage >= 90) return ' 🔥'
                    if (streakPercentage >= 75) return ' ⭐'
                    if (streakPercentage >= 50) return ' ✨'
                    if (streakPercentage >= 30) return ' 💫'
                    if (streakPercentage >= 15) return ' ⚡'
                    if (streakPercentage >= 5) return ' ✓'
                    return ''
                  })()}
                </span>
              </motion.div>
              <div
                className={`
                text-xs mt-[-24]
                ${(() => {
                  const totalNotes = keystrokeMap.filter((k) => k.type !== 'hidden').length
                  const streakPercentage =
                    totalNotes > 0 ? (gameState.streak / totalNotes) * 100 : 0
                  return streakPercentage >= 5 ? 'text-white/80' : 'text-text/60'
                })()}
              `}
              >
                STREAK (
                {(() => {
                  const totalNotes = keystrokeMap.filter((k) => k.type !== 'hidden').length
                  const streakPercentage =
                    totalNotes > 0 ? (gameState.streak / totalNotes) * 100 : 0
                  return streakPercentage.toFixed(0)
                })()}
                %)
              </div>
              <div
                className={`
                text-xs mt-1
                ${(() => {
                  const totalNotes = keystrokeMap.filter((k) => k.type !== 'hidden').length
                  const streakPercentage =
                    totalNotes > 0 ? (gameState.streak / totalNotes) * 100 : 0
                  return streakPercentage >= 5 ? 'text-white/60' : 'text-text/40'
                })()}
              `}
              >
                Max: {gameState.maxStreak}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Secondary Stats - Floating on Canvas Bottom Right */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-none">
          {/* Reaction Time */}
          <motion.div
            className={`
              backdrop-blur-sm border-2 px-3 py-1 text-right pointer-events-auto shadow-[4px_4px_0px_#000] pixel-border
              ${(() => {
                if (gameState.averageReactionTime < 0.05)
                  return 'bg-violet-900/90 border-violet-700' // Perfect
                if (gameState.averageReactionTime < 0.1) return 'bg-indigo-900/90 border-indigo-700' // High Distinction
                if (gameState.averageReactionTime < 0.15) return 'bg-blue-900/90 border-blue-700' // Distinction
                if (gameState.averageReactionTime < 0.2)
                  return 'bg-emerald-900/90 border-emerald-700' // Good
                return 'bg-background/85 border-border/50' // Default
              })()}
            `}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center">
              <RollingNumber
                value={Math.round(gameState.averageReactionTime * 1000)}
                className={`
                    text-lg font-['Press_Start_2P']
                    ${(() => {
                      if (gameState.averageReactionTime < 0.05) return 'text-violet-200'
                      if (gameState.averageReactionTime < 0.1) return 'text-indigo-200'
                      if (gameState.averageReactionTime < 0.15) return 'text-blue-200'
                      if (gameState.averageReactionTime < 0.2) return 'text-emerald-200'
                      return 'text-red-400'
                    })()}
                  `}
                duration={0.1}
              />
              <span
                className={`
                  text-xs font-['Press_Start_2P'] ml-1 opacity-70
                  ${(() => {
                    if (gameState.averageReactionTime < 0.05) return 'text-violet-200'
                    if (gameState.averageReactionTime < 0.1) return 'text-indigo-200'
                    if (gameState.averageReactionTime < 0.15) return 'text-blue-200'
                    if (gameState.averageReactionTime < 0.2) return 'text-emerald-200'
                    return 'text-red-400'
                  })()}
                `}
              >
                ms
              </span>
            </div>
            <div
              className={`
              text-xs
              ${(() => {
                return gameState.averageReactionTime < 0.2 ? 'text-white/80' : 'text-text/60'
              })()}
            `}
            >
              REACTION
            </div>
          </motion.div>
        </div>

        {/* Pause Overlay - Only covers Canvas */}
        {gameState.isPaused && (
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm z-20 flex items-center justify-center cursor-pointer"
            onClick={() => {
              const { resumeGame } = useTypoSyncStore.getState()
              resumeGame()
            }}
          >
            <div className="text-center bg-background/95 backdrop-blur-sm border-2 border-border px-8 py-6 shadow-[8px_8px_0px_#000] pixel-border">
              <div className="text-3xl font-['Press_Start_2P'] text-text mb-4">⏸️ PAUSED</div>
              <div className="text-sm font-['Press_Start_2P'] text-text/70 mb-2">
                Click anywhere or press ESC to resume
              </div>
              <div className="text-xs font-['Press_Start_2P'] text-text/50">
                Game time is frozen
              </div>
            </div>
          </div>
        )}

        {/* Game Complete Overlay - Covers entire page */}
        {!gameState.isActive &&
          gameState.sessionEndTime &&
          keystrokeMap.length > 0 &&
          keystrokeMap.filter((k) => k.type !== 'hidden' && k.state === 'upcoming').length ===
            0 && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="text-center bg-background/98 backdrop-blur-md border-4 border-border px-10 py-8 shadow-[12px_12px_0px_#000] pixel-border max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Fixed Header */}
                <motion.div
                  className="text-4xl font-['Press_Start_2P'] text-text mb-6 flex-shrink-0 relative"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="relative z-10">🎉 GAME COMPLETE! 🎉</div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-accent/20 via-primary/20 to-accent/20 rounded-lg -z-10"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                  {/* Main Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-['Press_Start_2P'] text-accent">
                        {gameState.score}
                      </div>
                      <div className="text-xs font-['Press_Start_2P'] text-text/60">SCORE</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-['Press_Start_2P'] text-primary">
                        {gameState.accuracy}%
                      </div>
                      <div className="text-xs font-['Press_Start_2P'] text-text/60">ACCURACY</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-['Press_Start_2P'] text-success">
                        {gameState.wpm}
                      </div>
                      <div className="text-xs font-['Press_Start_2P'] text-text/60">WPM</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-['Press_Start_2P'] text-warning">
                        {gameState.maxStreak}
                      </div>
                      <div className="text-xs font-['Press_Start_2P'] text-text/60">MAX STREAK</div>
                    </div>
                  </div>

                  {/* Detailed Statistics */}
                  <div className="mb-4 p-3 bg-background/50 border border-border/50 pixel-border">
                    <div className="text-xs font-['Press_Start_2P'] text-text/80 mb-2">
                      DETAILED STATS
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-emerald-400 font-['Press_Start_2P']">
                          {
                            keystrokeMap.filter(
                              (k) => k.state === 'hit' && k.timingAccuracy === 'sync',
                            ).length
                          }
                        </div>
                        <div className="text-text/60">SYNC</div>
                      </div>
                      <div className="text-center">
                        <div className="text-yellow-400 font-['Press_Start_2P']">
                          {
                            keystrokeMap.filter(
                              (k) =>
                                k.state === 'hit' &&
                                (k.timingAccuracy === 'early' || k.timingAccuracy === 'late'),
                            ).length
                          }
                        </div>
                        <div className="text-text/60">EARLY/LATE</div>
                      </div>
                      <div className="text-center">
                        <div className="text-red-400 font-['Press_Start_2P']">
                          {
                            keystrokeMap.filter((k) => k.state === 'missed' || k.state === 'typo')
                              .length
                          }
                        </div>
                        <div className="text-text/60">MISS/TYPO</div>
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="mb-4 p-3 bg-background/50 border border-border/50 pixel-border">
                    <div className="text-xs font-['Press_Start_2P'] text-text/80 mb-2">
                      SCORE BREAKDOWN
                    </div>
                    <div className="text-xs text-text/70 space-y-1">
                      <div className="flex justify-between">
                        <span>Perfect Sync (+100 pts):</span>
                        <span className="text-emerald-400">
                          {keystrokeMap.filter(
                            (k) => k.state === 'hit' && k.timingAccuracy === 'sync',
                          ).length * 100}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Early/Late (+50 pts):</span>
                        <span className="text-yellow-400">
                          {keystrokeMap.filter(
                            (k) =>
                              k.state === 'hit' &&
                              (k.timingAccuracy === 'early' || k.timingAccuracy === 'late'),
                          ).length * 50}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Miss/Typo (-25/-50 pts):</span>
                        <span className="text-red-400">
                          -
                          {keystrokeMap.filter((k) => k.state === 'missed').length * 25 +
                            keystrokeMap.filter((k) => k.state === 'typo').length * 50}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hidden Notes (+25 pts):</span>
                        <span className="text-purple-400">
                          {keystrokeMap.filter((k) => k.type === 'hidden' && k.state === 'hit')
                            .length * 25}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <div
                      className={`text-xl font-['Press_Start_2P'] mb-2 ${(() => {
                        if (gameState.accuracy >= 99) return 'text-violet-400'
                        if (gameState.accuracy >= 90) return 'text-indigo-400'
                        if (gameState.accuracy >= 75) return 'text-blue-400'
                        if (gameState.accuracy >= 50) return 'text-emerald-400'
                        return 'text-red-400'
                      })()}`}
                    >
                      {(() => {
                        if (gameState.accuracy >= 99) return '🏆 PERFECT!'
                        if (gameState.accuracy >= 90) return '⭐ HIGH DISTINCTION'
                        if (gameState.accuracy >= 75) return '🎯 DISTINCTION'
                        if (gameState.accuracy >= 50) return '✅ GOOD'
                        return '💪 KEEP TRYING'
                      })()}
                    </div>
                  </div>

                  {/* Grade Explanations */}
                  <div className="mb-4 p-3 bg-background/50 border border-border/50 pixel-border">
                    <div className="text-xs font-['Press_Start_2P'] text-text/80 mb-2">
                      GRADE SYSTEM
                    </div>
                    <div className="text-xs text-text/70 space-y-1">
                      <div className="flex justify-between">
                        <span>🏆 Perfect (99%+):</span>
                        <span className="text-violet-400">Master Level</span>
                      </div>
                      <div className="flex justify-between">
                        <span>⭐ High Distinction (90%+):</span>
                        <span className="text-indigo-400">Excellent</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🎯 Distinction (75%+):</span>
                        <span className="text-blue-400">Very Good</span>
                      </div>
                      <div className="flex justify-between">
                        <span>✅ Good (50%+):</span>
                        <span className="text-emerald-400">Satisfactory</span>
                      </div>
                      <div className="flex justify-between">
                        <span>💪 Keep Trying (&lt;50%):</span>
                        <span className="text-red-400">Needs Practice</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm font-['Press_Start_2P'] text-text/70 mb-4">
                    Click play again to retry!
                  </div>

                  {/* Close Button */}
                  <motion.button
                    className="bg-primary text-white font-['Press_Start_2P'] text-sm border-2 border-primary px-6 py-3 shadow-[4px_4px_0px_#000] pixel-border hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200"
                    onClick={() => {
                      // Reset game state to allow starting a new game
                      const { resetGame } = useTypoSyncStore.getState()
                      resetGame()
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    CLOSE RESULTS
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

        {/* Animated Background Overlay - Behind UI but above Canvas */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          {/* Shape 1 - Morphing circle/square that moves randomly */}
          <motion.div
            className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-accent/15 to-primary/15 backdrop-blur-sm"
            animate={{
              x: [30, 150, -50, 80, 30],
              y: [40, 120, 90, 160, 40],
              scale: [1, 1.8, 0.8, 1.4, 1],
              rotate: [0, 180, 270, 90, 360],
              borderRadius: ['50%', '20%', '40%', '10%', '50%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Shape 2 - Triangle that moves in random patterns */}
          <motion.div
            className="absolute w-16 h-16 bg-gradient-to-tr from-secondary/12 to-warning/12 backdrop-blur-sm right-32 top-20"
            style={{
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            }}
            animate={{
              x: [0, -120, 60, -80, 0],
              y: [0, 80, -40, 100, 0],
              scale: [0.8, 1.5, 1.0, 1.2, 0.8],
              rotate: [0, 150, 240, 60, 360],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.8,
            }}
          />

          {/* Shape 3 - Hexagon with random movement */}
          <motion.div
            className="absolute w-18 h-18 bg-gradient-to-bl from-success/8 to-accent/8 backdrop-blur-sm left-16 bottom-32"
            style={{
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
            }}
            animate={{
              x: [0, 100, -60, 140, 0],
              y: [0, -80, 40, -120, 0],
              scale: gameState.isActive ? [1, 1.6, 0.9, 1.3, 1] : [0.5, 1.0, 0.7, 0.8, 0.5],
              rotate: [0, 120, 200, 280, 360],
              opacity: [0.2, 0.5, 0.3, 0.6, 0.2],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.2,
            }}
          />

          {/* Shape 4 - Diamond with complex random movement */}
          <motion.div
            className="absolute w-14 h-14 bg-gradient-to-tl from-error/10 to-warning/10 backdrop-blur-sm transform rotate-45 right-20 bottom-20"
            animate={{
              x: [0, -140, 80, -100, 0],
              y: [0, -100, 60, -140, 0],
              scale: [1, 0.6, 1.4, 0.9, 1],
              rotate: [45, 180, 270, 135, 405],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />
        </div>

        {/* Upcoming Words Display - Bottom Center */}
        {gameState.isActive && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none w-full max-w-[70%]">
            <motion.div
              className="bg-background/95 backdrop-blur-sm border-2 border-border px-6 py-4 shadow-[4px_4px_0px_#000] pixel-border mx-auto max-w-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-sm font-['Press_Start_2P'] text-text/60 mb-3 text-center">
                UPCOMING WORDS
              </div>
              <div className="flex gap-3 items-center justify-start overflow-hidden">
                {(() => {
                  // Get ALL keystrokes (not just upcoming) to properly track word completion
                  const allKeystrokes = keystrokeMap.filter((k) => k.type !== 'hidden')

                  if (allKeystrokes.length === 0) {
                    return (
                      <div className="text-lg font-['Press_Start_2P'] text-text/50">
                        No upcoming keys
                      </div>
                    )
                  }

                  // Group ALL keystrokes into words first
                  const allWords: Array<{
                    text: string
                    keystrokes: Keystroke[]
                    isFullyCompleted: boolean
                    hasUpcoming: boolean
                    wordId: string
                  }> = []
                  let currentWord = ''
                  let currentKeystrokes: Keystroke[] = []
                  let wordIndex = 0

                  for (const keystroke of allKeystrokes) {
                    const key = keystroke.key
                    const displayKey = key === '[Space]' ? ' ' : key === '[Enter]' ? '↵' : key

                    if (key === '[Space]' || key === '[Enter]') {
                      if (currentWord.length > 0) {
                        // Check if this word is fully completed (all keystrokes are hit/missed/typo)
                        const isFullyCompleted = currentKeystrokes.every(
                          (k) => k.state !== 'upcoming',
                        )
                        const hasUpcoming = currentKeystrokes.some((k) => k.state === 'upcoming')
                        allWords.push({
                          text: currentWord,
                          keystrokes: [...currentKeystrokes],
                          isFullyCompleted,
                          hasUpcoming,
                          wordId: `word-${wordIndex++}-${currentWord}`,
                        })
                        currentWord = ''
                        currentKeystrokes = []
                      }
                      if (key === '[Space]') {
                        const isFullyCompleted = keystroke.state !== 'upcoming'
                        const hasUpcoming = keystroke.state === 'upcoming'
                        allWords.push({
                          text: '▭',
                          keystrokes: [keystroke],
                          isFullyCompleted,
                          hasUpcoming,
                          wordId: `space-${wordIndex++}-${keystroke.startTime}`,
                        })
                      } else if (key === '[Enter]') {
                        const isFullyCompleted = keystroke.state !== 'upcoming'
                        const hasUpcoming = keystroke.state === 'upcoming'
                        allWords.push({
                          text: '↵',
                          keystrokes: [keystroke],
                          isFullyCompleted,
                          hasUpcoming,
                          wordId: `enter-${wordIndex++}-${keystroke.startTime}`,
                        })
                      }
                    } else {
                      currentWord += displayKey
                      currentKeystrokes.push(keystroke)
                    }
                  }

                  // Add remaining word if any
                  if (currentWord.length > 0) {
                    const isFullyCompleted = currentKeystrokes.every((k) => k.state !== 'upcoming')
                    const hasUpcoming = currentKeystrokes.some((k) => k.state === 'upcoming')
                    allWords.push({
                      text: currentWord,
                      keystrokes: [...currentKeystrokes],
                      isFullyCompleted,
                      hasUpcoming,
                      wordId: `final-${wordIndex++}-${currentWord}`,
                    })
                  }

                  // Only show words that have upcoming keystrokes OR are not fully completed
                  // This ensures words only disappear when the ENTIRE word is finished
                  const wordsToShow = allWords
                    .filter((word) => word.hasUpcoming || !word.isFullyCompleted)
                    .slice(0, 8) // Show up to 8 words

                  // Ensure minimum 2 words - if we have less than 2, show some completed words too
                  const finalWordsToShow =
                    wordsToShow.length >= 2 ? wordsToShow : allWords.slice(0, Math.max(2, 8))

                  return (
                    <motion.div
                      className="flex gap-3 items-center"
                      layout
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      {finalWordsToShow.map((word, index) => (
                        <motion.div
                          key={word.wordId}
                          className={`
                            font-['Press_Start_2P'] border-2 pixel-border text-center whitespace-nowrap
                            ${
                              index === 0
                                ? 'text-2xl px-6 py-3 bg-accent text-background border-accent shadow-[0_0_12px_rgba(181,137,0,0.6)] min-w-[80px]'
                                : 'text-lg px-4 py-2 bg-card/70 text-text/80 border-border/50 min-w-[60px]'
                            }
                            ${word.isFullyCompleted ? 'opacity-40' : ''}
                          `}
                          initial={{ opacity: 0, x: 100, scale: 0.8 }}
                          animate={{
                            opacity: word.isFullyCompleted ? 0.4 : 1,
                            x: 0,
                            scale: index === 0 ? [1, 1.02, 1] : 1,
                          }}
                          exit={{
                            opacity: 0,
                            x: -100,
                            scale: 0.8,
                          }}
                          layout
                          transition={{
                            duration: 0.4,
                            ease: 'easeInOut',
                            delay: index * 0.05,
                          }}
                        >
                          {word.text}
                        </motion.div>
                      ))}
                    </motion.div>
                  )
                })()}
              </div>
            </motion.div>
          </div>
        )}

        {/* Debug Info - Top Left of Canvas (Hidden on smaller screens) */}
        <motion.div
          className="absolute top-2 left-2 text-text font-['Press_Start_2P'] text-xs bg-card/90 p-2 border-2 border-border pixel-border shadow-[4px_4px_0px_#000] backdrop-blur-sm hidden lg:block pointer-events-auto z-10"
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div>Time: {gameTime.toFixed(2)}s</div>
          <div>
            Notes:{' '}
            {keystrokeMap.filter((k) => k.state === 'upcoming' && k.type !== 'hidden').length}
          </div>
          <div>
            Hidden:{' '}
            {keystrokeMap.filter((k) => k.state === 'upcoming' && k.type === 'hidden').length}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
