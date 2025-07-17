'use client'

import React, { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Grid configuration to match exact game UI bounds
// Camera bounds: left: -8, right: 8, top: 3, bottom: -3
const CAMERA_LEFT = -8
const CAMERA_RIGHT = 8
const CAMERA_TOP = 3
const CAMERA_BOTTOM = -3
const CAMERA_WIDTH = CAMERA_RIGHT - CAMERA_LEFT // 16
const CAMERA_HEIGHT = CAMERA_TOP - CAMERA_BOTTOM // 6

const GRID_SIZE_X = 16 // Horizontal grid divisions
const GRID_SIZE_Y = 12 // Vertical grid divisions (adjusted for 6 height)
const GRID_SPACING_X = CAMERA_WIDTH / GRID_SIZE_X // 1.0
const GRID_SPACING_Y = CAMERA_HEIGHT / GRID_SIZE_Y // 0.5

// Use the smaller spacing to ensure squares are actually square
const SQUARE_SIZE = Math.min(GRID_SPACING_X, GRID_SPACING_Y) // 0.5
const TOTAL_SQUARES = GRID_SIZE_X * GRID_SIZE_Y

// Animation timing
const ANIMATION_INTERVAL = 1000 // 1 second
const FADE_DURATION = 300 // 300ms fade in/out
const ROTATION_DURATION = 400 // 400ms rotation animation

interface GridSquareState {
  isVisible: boolean
  scale: number // Use scale for fading instead of opacity
  fadeStartTime: number
  fadeDirection: 'in' | 'out' | 'idle'
  rotation: number // Current rotation in radians
  targetRotation: number // Target rotation for smooth animation
  rotationStartTime: number // When rotation animation started
  isRotating: boolean // Whether currently rotating
  x: number
  y: number
}

// Calculate probability based on distance from bottom-right area (moved slightly toward top-left)
const getAppearanceProbability = (x: number, y: number): number => {
  const centerX = GRID_SIZE_X - 3 // was GRID_SIZE_X - 1 (15), now 13 (moved 2 left)
  const centerY = GRID_SIZE_Y - 3 // was GRID_SIZE_Y - 1 (11), now 9 (moved 2 up)

  const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))

  // EXTREMELY concentrated distribution - bottom-right area (shifted toward top-left)
  if (distance === 0) {
    // Exact center position (13,9)
    return 0.99 // 99% chance - almost always
  } else if (distance <= 1) {
    // Immediately adjacent squares
    return 0.85 // 85% chance
  } else if (distance <= 1.5) {
    // Very close squares
    return 0.5 // 50% chance
  } else if (distance <= 2.5) {
    // Close squares
    return 0.2 // 20% chance
  } else if (distance <= 3.5) {
    // Medium distance
    return 0.05 // 5% chance
  } else {
    // Far squares - almost never
    return 0.005 // 0.5% chance
  }
}

export default function AnimatedGrid() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const lastUpdateTime = useRef(0)
  const animationCounter = useRef(0)

  // Simple array-based state for better performance
  const squareStates = useRef<GridSquareState[]>([])

  // Initialize grid state
  const initializeGrid = useCallback(() => {
    const states: GridSquareState[] = []

    for (let x = 0; x < GRID_SIZE_X; x++) {
      for (let y = 0; y < GRID_SIZE_Y; y++) {
        // In debug mode, show probability zones AND test squares
        let isDebugVisible = false

        // Always show center test square for debugging
        const centerX = GRID_SIZE_X - 3
        const centerY = GRID_SIZE_Y - 3
        if (x === centerX && y === centerY) {
          isDebugVisible = true
        }

        states.push({
          isVisible: isDebugVisible,
          scale: isDebugVisible ? 1.0 : 0.0, // Full scale or no scale
          fadeStartTime: 0,
          fadeDirection: 'idle',
          rotation: 0, // Start with no rotation
          targetRotation: 0, // No target rotation initially
          rotationStartTime: 0, // No rotation animation
          isRotating: false, // Not rotating
          x,
          y,
        })
      }
    }

    squareStates.current = states
  }, [])

  // Initialize matrices for instanced rendering
  const tempMatrix = useMemo(() => new THREE.Matrix4(), [])

  // Initialize all instance matrices
  const initializeInstanceMatrices = useCallback(() => {
    if (!meshRef.current) return

    const mesh = meshRef.current

    // Initialize all instances with default matrices (off-screen)
    for (let i = 0; i < TOTAL_SQUARES; i++) {
      tempMatrix.makeTranslation(1000, 1000, -10) // Off-screen initially
      tempMatrix.scale(new THREE.Vector3(0.1, 0.1, 1))
      mesh.setMatrixAt(i, tempMatrix)
    }

    mesh.instanceMatrix.needsUpdate = true
  }, [tempMatrix])

  // Initialize grid and matrices
  useMemo(() => {
    initializeGrid()
  }, [initializeGrid])

  // Animation logic
  const triggerAnimations = useCallback((currentTime: number) => {
    squareStates.current.forEach((square) => {
      // Skip if currently animating (either fading or rotating)
      if (square.fadeDirection !== 'idle' || square.isRotating) return

      const probability = getAppearanceProbability(square.x, square.y)

      if (square.isVisible) {
        // 50% chance to disappear, 50% chance to stay and rotate
        if (Math.random() < 0.5) {
          square.fadeDirection = 'out'
          square.fadeStartTime = currentTime
        } else {
          // Square survives - start animated 90 degree rotation
          square.targetRotation = square.rotation + Math.PI / 2
          square.rotationStartTime = currentTime
          square.isRotating = true
        }
      } else {
        // Probability-based chance to appear
        if (Math.random() < probability) {
          square.fadeDirection = 'in'
          square.fadeStartTime = currentTime
          square.rotation = 0 // Reset rotation for new squares
          square.targetRotation = 0 // Reset target rotation
          square.isRotating = false // Not rotating
        }
      }
    })
  }, [])

  // Main animation frame loop
  useFrame((state) => {
    if (!meshRef.current) return

    const currentTime = state.clock.elapsedTime * 1000
    const mesh = meshRef.current

    // Initialize matrices on first frame
    if (currentTime > 0 && lastUpdateTime.current === 0) {
      initializeInstanceMatrices()
      lastUpdateTime.current = currentTime // Set initial time
    }

    // Trigger new animations every second (1000ms) - GLOBAL timing for all squares
    const timeSinceLastUpdate = currentTime - lastUpdateTime.current
    if (timeSinceLastUpdate >= ANIMATION_INTERVAL) {
      animationCounter.current++
      triggerAnimations(currentTime)
      lastUpdateTime.current = currentTime // Reset timer to current time
    }

    // Update all squares
    let needsMatrixUpdate = false

    squareStates.current.forEach((square, index) => {
      // Handle fade animations using scale
      if (square.fadeDirection !== 'idle') {
        const elapsed = currentTime - square.fadeStartTime
        const progress = Math.min(elapsed / FADE_DURATION, 1)

        let newScale: number
        if (square.fadeDirection === 'in') {
          newScale = progress // Scale from 0 to 1
        } else {
          newScale = 1 - progress // Scale from 1 to 0
        }

        square.scale = newScale

        // Check if animation is complete
        if (progress >= 1) {
          if (square.fadeDirection === 'in') {
            square.fadeDirection = 'idle'
            square.isVisible = true
            square.scale = 1.0
          } else {
            square.fadeDirection = 'idle'
            square.isVisible = false
            square.scale = 0.0
          }
        }
      }

      // Handle rotation animations
      if (square.isRotating) {
        const elapsed = currentTime - square.rotationStartTime
        const progress = Math.min(elapsed / ROTATION_DURATION, 1)

        // Smooth interpolation from current rotation to target rotation
        const startRotation = square.rotation
        const rotationDiff = square.targetRotation - startRotation
        square.rotation = startRotation + rotationDiff * progress

        // Check if rotation animation is complete
        if (progress >= 1) {
          square.rotation = square.targetRotation
          square.isRotating = false
        }
      }

      // Update instance matrix - always position correctly, use scale for fading
      if (square.isVisible || square.fadeDirection !== 'idle') {
        // Position calculation - map grid coordinates to exact camera bounds
        const positionX = CAMERA_LEFT + square.x * GRID_SPACING_X + GRID_SPACING_X / 2
        const positionY = CAMERA_TOP - square.y * GRID_SPACING_Y - GRID_SPACING_Y / 2

        // Use current scale for smooth fade animation
        const currentScale = square.scale * SQUARE_SIZE * 0.8

        // Set transform matrix with animated scale and rotation
        // Order: Translation -> Rotation -> Scale
        tempMatrix.makeTranslation(positionX, positionY, -1)

        // Apply rotation around Z-axis if needed
        if (square.rotation !== 0) {
          const rotationMatrix = new THREE.Matrix4().makeRotationZ(square.rotation)
          tempMatrix.multiply(rotationMatrix)
        }

        // Apply scale last
        const scaleMatrix = new THREE.Matrix4().makeScale(currentScale, currentScale, 1)
        tempMatrix.multiply(scaleMatrix)

        mesh.setMatrixAt(index, tempMatrix)
        needsMatrixUpdate = true
      } else {
        // Move completely invisible squares off-screen
        tempMatrix.makeTranslation(1000, 1000, -10)
        tempMatrix.scale(new THREE.Vector3(0.001, 0.001, 1))
        mesh.setMatrixAt(index, tempMatrix)
        needsMatrixUpdate = true
      }
    })

    // Update the instance matrices if needed
    if (needsMatrixUpdate) {
      mesh.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, TOTAL_SQUARES]}
      renderOrder={-1000}
      position={[0, 0, 0]}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color={'#1f2937'}
        transparent
        opacity={0.1}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  )
}
