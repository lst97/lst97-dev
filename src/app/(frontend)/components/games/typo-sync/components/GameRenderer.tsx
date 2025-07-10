'use client'

import React, { useRef, useEffect, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Box } from '@react-three/drei'
import * as THREE from 'three'
import { useTypoSyncStore } from '../store/typoSyncStore'
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
}

function GlassParticle({
  position,
  velocity,
  startTime,
  size,
  rotationSpeed,
  color,
}: GlassParticleProps) {
  const particleRef = useRef<THREE.Mesh>(null)
  const velocityRef = useRef<[number, number, number]>([...velocity])
  const prevTimeRef = useRef<number>(Date.now())

  useFrame(() => {
    if (!particleRef.current) return

    const now = Date.now()
    const delta = (now - prevTimeRef.current) / 1000 // seconds since last frame
    prevTimeRef.current = now

    const gravity = -1.5
    const groundY = -1.5 // Ground level
    const bounceDamping = 0.6 // Energy loss on bounce (slower bouncing)
    const friction = 0.98 // Air resistance

    // Update velocity with gravity
    const v = velocityRef.current
    v[1] += gravity * delta
    v[0] *= friction
    v[2] *= friction

    // Update position
    const x = particleRef.current.position.x + v[0] * delta
    let y = particleRef.current.position.y + v[1] * delta
    const z = particleRef.current.position.z + v[2] * delta

    // Bounce on ground
    if (y <= groundY) {
      y = groundY
      if (Math.abs(v[1]) > 0.2) {
        v[1] = -v[1] * bounceDamping
      } else {
        v[1] = 0 // settle
      }
    }

    particleRef.current.position.set(x, y, z)

    // Slower rotation for more realistic tumbling
    particleRef.current.rotation.x += rotationSpeed[0] * delta * 0.5
    particleRef.current.rotation.y += rotationSpeed[1] * delta * 0.5
    particleRef.current.rotation.z += rotationSpeed[2] * delta * 0.5

    // Much more gradual fade out over longer time
    const elapsed = (now - startTime) / 1000
    const fadeTime = 4.0
    const fadeStart = 2.0

    let opacity = 1.0
    if (elapsed > fadeStart) {
      const fadeProgress = (elapsed - fadeStart) / (fadeTime - fadeStart)
      // Use smoother fade curve for more realistic effect
      opacity = Math.max(0, 1.0 - Math.pow(fadeProgress, 1.5))
    }

    const material = particleRef.current.material as THREE.MeshStandardMaterial
    material.opacity = opacity

    // Only hide when completely transparent
    particleRef.current.visible = opacity > 0.01
  })

  return (
    <mesh ref={particleRef} position={position as any}>
      <boxGeometry args={[size, size, size * 0.4]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={1.0}
        roughness={0.1}
        metalness={0.3}
      />
    </mesh>
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
  const [glassParticles, setGlassParticles] = useState<
    Array<{
      id: number
      position: [number, number, number]
      velocity: [number, number, number]
      startTime: number
      size: number
      rotationSpeed: [number, number, number]
      color: string
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

    if (prevState === 'upcoming' && currentState === 'hit' && !isBreaking) {
      console.log(
        '🎯 Starting glass break animation for keystroke:',
        uniqueId,
        'at time:',
        gameTime,
      )
      setIsBreaking(true)
      setBreakStartTime(Date.now())

      // Create glass particles with more variation and bigger sizes
      const particles = []
      const numParticles = 15 + Math.floor(Math.random() * 8) // 15-22 particles for more variation

      for (let i = 0; i < numParticles; i++) {
        particles.push({
          id: i,
          position: [
            (Math.random() - 0.5) * 0.6, // Wider spread for more dramatic effect
            (Math.random() - 0.5) * 0.6,
            0.1 + Math.random() * 0.2, // Varied Z position
          ] as [number, number, number],
          velocity: [
            (Math.random() - 0.5) * 6, // More varied velocity
            Math.random() * 4 + 1, // Stronger upward bias
            (Math.random() - 0.5) * 3,
          ] as [number, number, number],
          startTime: Date.now() + Math.random() * 100, // Slight delay variation for more organic feel
          size: 0.08 + Math.random() * 0.12, // Bigger particles (0.08 to 0.2)
          rotationSpeed: [
            (Math.random() - 0.5) * 8, // More varied rotation speeds
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
          ] as [number, number, number],
          color: keystroke.type === 'hidden' ? '#d8b4fe' : 'rgb(252, 211, 77)',
        })
      }

      setGlassParticles(particles)
      console.log('💥 Created', particles.length, 'glass particles for', uniqueId)
    }

    // Update previous state ref
    prevStateRef.current = currentState
  }, [keystroke.state, isBreaking, uniqueId, gameTime])

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
      // Glass break animation: hide main box and show particles
      const breakTime = (Date.now() - breakStartTime) / 1000
      const breakDuration = 5.0 // Reduced to 5 seconds total animation

      console.log(
        `🔥 Glass break animation: breakTime=${breakTime.toFixed(3)}s, particles=${glassParticles.length}, id=${uniqueId}`,
      )

      if (breakTime < 0.15) {
        // Brief flash/scale effect at the moment of break
        const flashIntensity = 1.0 + (0.15 - breakTime) * 4 // More dramatic scale up
        groupRef.current.scale.setScalar(flashIntensity)
        groupRef.current.position.x = worldPos.x
        groupRef.current.position.y = worldPos.y
        groupRef.current.position.z = 0
        groupRef.current.visible = true
      } else {
        // Hide main box completely after break starts
        groupRef.current.visible = false
        if (breakTime >= breakDuration && glassParticles.length > 0) {
          setGlassParticles([]) // Clean up particles
          console.log('✅ Glass break animation completed, particles cleaned up for', uniqueId)
        }
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
    }
  })

  return (
    <>
      {/* Main letter box group */}
      <group ref={groupRef}>
        {/* Gray border frame */}
        <Box args={[0.9, 0.9, 0.08]}>
          <meshStandardMaterial
            color="#666666"
            transparent
            opacity={isBreaking ? 0.0 : 1.0}
            roughness={0.3}
            metalness={0.1}
          />
        </Box>

        {/* Amber letter box background - set to transparent when breaking */}
        <Box ref={boxRef} args={[0.8, 0.8, 0.1]}>
          <meshStandardMaterial
            color={boxColor}
            transparent
            opacity={isBreaking ? 0.0 : 1.0}
            roughness={0.3}
            metalness={0.1}
          />
        </Box>

        {/* Character text inside the box */}
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.4}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          font="/fonts/PressStart2P-Regular.ttf"
          outlineWidth={0.008}
          outlineColor="#FFFFFF"
          visible={!isBreaking}
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
      {/* Glowing background for beat effect - wider to match container */}
      <mesh ref={glowRef}>
        <planeGeometry args={[0.4, 5.0]} />
        <meshBasicMaterial color={GAME_CONFIG.COLORS.HIT_ZONE} transparent opacity={0.2} />
      </mesh>

      {/* Main hit zone line - bigger and more prominent */}
      <group ref={lineRef}>
        <mesh>
          <planeGeometry args={[0.2, 4.5]} />
          <meshBasicMaterial color={GAME_CONFIG.COLORS.HIT_ZONE} transparent opacity={0.8} />
        </mesh>

        {/* Additional border lines to match container style */}
        <mesh position={[-0.12, 0, 0.01]}>
          <planeGeometry args={[0.04, 4.5]} />
          <meshBasicMaterial color={GAME_CONFIG.COLORS.HIT_ZONE} transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.12, 0, 0.01]}>
          <planeGeometry args={[0.04, 4.5]} />
          <meshBasicMaterial color={GAME_CONFIG.COLORS.HIT_ZONE} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Hit zone label - larger and more visible */}
      <Text
        position={[0, 2.8, 0.01]}
        fontSize={0.25}
        color={GAME_CONFIG.COLORS.HIT_ZONE}
        anchorX="center"
        anchorY="middle"
        font="/fonts/PressStart2P-Regular.ttf"
        outlineWidth={0.01}
        outlineColor="#333333"
      >
        HIT ZONE
      </Text>
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
    const num = 20
    for (let i = 0; i < num; i++) {
      parts.push({
        id: i,
        position: [0, 0, 0] as [number, number, number],
        velocity: [4 + Math.random() * 3, 2 + Math.random() * 2, (Math.random() - 0.5) * 2] as [
          number,
          number,
          number,
        ],
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

  // position at hit zone
  const hitZoneWorld = screenToWorld(GAME_CONFIG.HIT_ZONE_X, CANVAS_HEIGHT / 2)

  return (
    <>
      {particles.map((p) => (
        <GlassParticle
          key={`hidden-${note.startTime}-${p.id}`}
          position={[hitZoneWorld.x, hitZoneWorld.y, 0.1] as any}
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

function GameScene({
  keystrokeMap,
  gameTime,
  gameState,
  beatTimestamps,
}: GameSceneProps) {
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
      const hiddenNotes = keystrokeMap.filter(k => k.type === 'hidden')
      const regularKeys = keystrokeMap.filter(k => k.type !== 'hidden')
      
      console.log('🎮 Visibility check:', {
        gameTime: gameTime.toFixed(2),
        totalKeystrokes: keystrokeMap.length,
        regularKeys: regularKeys.length,
        hiddenNotes: hiddenNotes.length,
        visibleRendered: visible.length,
        upcomingVisible: visible.filter((k) => k.state === 'upcoming').length,
        upcomingHidden: hiddenNotes.filter(k => k.state === 'upcoming').length,
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
      {keystrokeMap
        .filter((k) => k.type === 'hidden' && k.state === 'hit')
        .map((note) => {
          console.log(`🟣 Rendering HiddenNoteBurst for hidden note at ${note.startTime.toFixed(2)}s`)
          return (
            <HiddenNoteBurst
              key={`burst-hidden-${note.startTime}`}
              note={note}
              gameTime={gameTime}
            />
          )
        })}
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
    const hiddenNotes = keystrokeMap.filter(k => k.type === 'hidden')
    console.log('🟣 GameRenderer: unified keystrokeMap hidden notes', {
      totalHiddenNotes: hiddenNotes.length,
      upcomingHiddenNotes: hiddenNotes.filter((h) => h.state === 'upcoming').length,
      hitHiddenNotes: hiddenNotes.filter((h) => h.state === 'hit').length,
      firstFewHiddenNotes: hiddenNotes.slice(0, 3).map(h => ({ time: h.startTime.toFixed(3), state: h.state })),
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

  // Update game time based on game state
  useEffect(() => {
    if (!gameState.isActive || !gameState.gameStartTime) {
      setGameTime(0)
      return
    }

    const updateTime = () => {
      const currentTime = performance.now() / 1000 // Convert to seconds to match keystroke timestamps
      const elapsedTime = currentTime - gameState.gameStartTime! / 1000 // gameStartTime is in ms, convert to seconds
      setGameTime(elapsedTime)
    }

    updateTime()
    const interval = setInterval(updateTime, 16) // ~60fps

    return () => clearInterval(interval)
  }, [gameState.isActive, gameState.gameStartTime])

  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-b from-[#f5f5f5] to-[#e0e0e0] rounded-lg overflow-hidden border-2 border-[#888888] pixel-border">
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
        }}
        dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1} // Better text sharpness
      >
        {/* Game scene with background effect and beat timestamps */}
        <GameScene
          keystrokeMap={keystrokeMap}
          gameTime={gameTime}
          gameState={gameState}
          beatTimestamps={beatTimestamps}
        />
      </Canvas>

      {/* Overlay UI elements matching POC style */}
      <div className="absolute top-4 left-4 text-gray-800 font-mono text-sm bg-white/80 p-2 rounded backdrop-blur-sm">
        <div>Time: {gameTime.toFixed(2)}s</div>
        <div>Notes: {keystrokeMap.filter((k) => k.state === 'upcoming' && k.type !== 'hidden').length}</div>
        <div>Hidden: {keystrokeMap.filter((k) => k.state === 'upcoming' && k.type === 'hidden').length}</div>
        <div>Beats: {beatTimestamps.length}</div>
      </div>

      <div className="absolute top-4 right-4 text-gray-800 font-mono text-sm text-right bg-white/80 p-2 rounded backdrop-blur-sm">
        <div>Score: {gameState.score}</div>
        {gameState.feedback && (
          <div
            className={`mt-2 font-bold ${
              gameState.feedbackColor === '#00FF00'
                ? 'text-green-600'
                : gameState.feedbackColor === '#FF0000'
                  ? 'text-red-600'
                  : 'text-orange-600'
            }`}
          >
            {gameState.feedback}
          </div>
        )}
      </div>
    </div>
  )
}
