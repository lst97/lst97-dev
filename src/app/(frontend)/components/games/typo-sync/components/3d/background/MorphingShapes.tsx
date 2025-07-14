'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Keystroke } from '../../../types'

interface MorphingShapesProps {
  keystrokeMap: Keystroke[]
  gameTime: number
  gameState: any
}

interface ShapeState {
  currentShapeIndex: number
  targetShapeIndex: number
  isMorphing: boolean
  morphProgress: number
  morphStartTime: number
  gridPosition: [number, number]
  targetPosition: [number, number]
  isMoving: boolean
  moveStartTime: number
  moveProgress: number
}

export function MorphingShapes({ keystrokeMap, gameTime, gameState }: MorphingShapesProps) {
  const mesh1Ref = useRef<THREE.Mesh>(null)
  const mesh2Ref = useRef<THREE.Mesh>(null)

  // Atomic state management to prevent flashing - shapes start with different forms
  const [shape1State, setShape1State] = useState<ShapeState>({
    currentShapeIndex: 0, // Start as Circle
    targetShapeIndex: 0,
    isMorphing: false,
    morphProgress: 0,
    morphStartTime: 0,
    gridPosition: [0, 1], // Bottom-left corner
    targetPosition: [0, 1],
    isMoving: false,
    moveStartTime: 0,
    moveProgress: 0,
  })

  const [shape2State, setShape2State] = useState<ShapeState>({
    currentShapeIndex: 1, // Start as Square (different from shape1)
    targetShapeIndex: 1,
    isMorphing: false,
    morphProgress: 0,
    morphStartTime: 0,
    gridPosition: [1, 0], // Top-right corner (diagonal from shape1)
    targetPosition: [1, 0],
    isMoving: false,
    moveStartTime: 0,
    moveProgress: 0,
  })

  const processedHits = useRef<Set<string>>(new Set())

  // Reset processed hits when starting a new game
  useEffect(() => {
    if (gameState.isActive && gameState.gameStartTime) {
      processedHits.current.clear()
    }
  }, [gameState.isActive, gameState.gameStartTime])

  // Track previous pause state to prevent shape reset on pause
  const prevPausedRef = useRef(gameState.isPaused)

  // Define shape configurations with shape type IDs for shader (removed Oval and Rectangle)
  const shapes = [
    { name: 'Circle', shapeType: 0 },
    { name: 'Square', shapeType: 1 },
    { name: 'Diamond', shapeType: 2 },
    { name: 'Triangle', shapeType: 3 },
    { name: 'Hexagon', shapeType: 4 },
    { name: 'Star', shapeType: 5 },
  ]

  // Grid system: 2x2 grid with positions [0,0], [0,1], [1,0], [1,1] - moved to top right with closer spacing
  const getWorldPosition = (gridPos: [number, number]): [number, number, number] => {
    const spacing = 1.0 // Increased spacing for a larger gap
    const offsetX = (gridPos[0] - 0.5) * spacing + 2.5 // Move further to the right
    const offsetY = (gridPos[1] - 0.5) * spacing + 1.2 // Move up (positive Y)
    return [offsetX, offsetY, -4.8]
  }

  // === BOUNDS CHECKING UTILITY ===
  const isWithinBounds = (pos: [number, number]): boolean => {
    return pos[0] >= 0 && pos[0] <= 1 && pos[1] >= 0 && pos[1] <= 1
  }

  // === RANDOM DIRECTION LOGIC ===
  const getRandomDirection = (): [number, number] => {
    const directions: [number, number][] = [
      [0, 1], // down
      [0, -1], // up
      [1, 0], // right
      [-1, 0], // left
    ]

    // Return a completely random direction
    return directions[Math.floor(Math.random() * directions.length)]
  }

  // === MOVEMENT PLANNER (PLANNING PHASE) ===
  interface MovementPlan {
    shape1Target: [number, number]
    shape2Target: [number, number]
    shape1WillMove: boolean
    shape2WillMove: boolean
  }

  const planMovements = (): MovementPlan => {
    // Get random directions for both shapes
    const shape1RandomDir = getRandomDirection()
    const shape2RandomDir = getRandomDirection()

    // Calculate potential targets
    const shape1PotentialTarget: [number, number] = [
      shape1State.gridPosition[0] + shape1RandomDir[0],
      shape1State.gridPosition[1] + shape1RandomDir[1],
    ]
    const shape2PotentialTarget: [number, number] = [
      shape2State.gridPosition[0] + shape2RandomDir[0],
      shape2State.gridPosition[1] + shape2RandomDir[1],
    ]

    // Determine if moves are valid (within bounds)
    const shape1MoveIsValid = isWithinBounds(shape1PotentialTarget)
    const shape2MoveIsValid = isWithinBounds(shape2PotentialTarget)

    // Determine intended targets. If move is invalid, they intend to stay.
    const shape1IntendedTarget = shape1MoveIsValid
      ? shape1PotentialTarget
      : shape1State.gridPosition
    const shape2IntendedTarget = shape2MoveIsValid
      ? shape2PotentialTarget
      : shape2State.gridPosition

    let shape1FinalTarget = shape1IntendedTarget
    let shape2FinalTarget = shape2IntendedTarget

    // Check for conflicts:
    // 1. Both shapes target the same cell.
    // 2. Shapes try to swap positions.
    const isConflict =
      (shape1FinalTarget[0] === shape2FinalTarget[0] &&
        shape1FinalTarget[1] === shape2FinalTarget[1]) ||
      (shape1FinalTarget[0] === shape2State.gridPosition[0] &&
        shape1FinalTarget[1] === shape2State.gridPosition[1] &&
        shape2FinalTarget[0] === shape1State.gridPosition[0] &&
        shape2FinalTarget[1] === shape1State.gridPosition[1])

    if (isConflict) {
      // On conflict, randomly pick one shape to stay in its original position
      if (Math.random() < 0.5) {
        // Shape 1 stays. Shape 2 can still move, unless it was targeting Shape 1's original spot.
        shape1FinalTarget = shape1State.gridPosition
        if (
          shape2FinalTarget[0] === shape1FinalTarget[0] &&
          shape2FinalTarget[1] === shape1FinalTarget[1]
        ) {
          shape2FinalTarget = shape2State.gridPosition // Shape 2 must also stay
        }
      } else {
        // Shape 2 stays. Shape 1 can still move, unless it was targeting Shape 2's original spot.
        shape2FinalTarget = shape2State.gridPosition
        if (
          shape1FinalTarget[0] === shape2FinalTarget[0] &&
          shape1FinalTarget[1] === shape2FinalTarget[1]
        ) {
          shape1FinalTarget = shape1State.gridPosition // Shape 1 must also stay
        }
      }
    }

    return {
      shape1Target: shape1FinalTarget,
      shape2Target: shape2FinalTarget,
      shape1WillMove:
        shape1FinalTarget[0] !== shape1State.gridPosition[0] ||
        shape1FinalTarget[1] !== shape1State.gridPosition[1],
      shape2WillMove:
        shape2FinalTarget[0] !== shape2State.gridPosition[0] ||
        shape2FinalTarget[1] !== shape2State.gridPosition[1],
    }
  }

  // === MOVEMENT EXECUTOR (MOVE PHASE) ===
  const executeMovementPlan = (
    plan: MovementPlan,
    shape1NextIndex: number,
    shape2NextIndex: number,
  ) => {
    // Execute movements atomically based on the plan
    setShape1State((prev) => ({
      ...prev,
      targetShapeIndex: shape1NextIndex,
      isMorphing: true,
      morphStartTime: gameTime,
      morphProgress: 0,
      targetPosition: plan.shape1Target,
      isMoving: plan.shape1WillMove,
      moveStartTime: gameTime,
      moveProgress: 0,
    }))

    setShape2State((prev) => ({
      ...prev,
      targetShapeIndex: shape2NextIndex,
      isMorphing: true,
      morphStartTime: gameTime,
      morphProgress: 0,
      targetPosition: plan.shape2Target,
      isMoving: plan.shape2WillMove,
      moveStartTime: gameTime,
      moveProgress: 0,
    }))
  }

  useFrame((state) => {
    if (!mesh1Ref.current || !mesh2Ref.current) return
    // Preserve shapes when pausing - don't reset to circles
    if (gameState.isPaused) {
      prevPausedRef.current = true
      return // Just stop updates when paused, preserve current shapes
    }

    // Update previous pause state
    prevPausedRef.current = false

    // Check for new hits to trigger morphing and movement
    const allHits = keystrokeMap.filter((k) => k.state === 'hit')

    allHits.forEach((hit) => {
      const hitId = `${hit.startTime}-${hit.key}-${hit.timingAccuracy || 'unknown'}`
      if (!processedHits.current.has(hitId)) {
        processedHits.current.add(hitId)

        // Calculate moves for both shapes with conflict resolution - independent morphing
        if (!shape1State.isMorphing && !shape2State.isMorphing) {
          // === TWO-PHASE MOVEMENT SYSTEM ===

          // Each shape advances to its own next shape independently
          const shape1NextIndex = (shape1State.currentShapeIndex + 1) % shapes.length
          const shape2NextIndex = (shape2State.currentShapeIndex + 1) % shapes.length

          // PHASE 1: PLANNING - Plan movements with proper collision detection
          const movementPlan = planMovements()

          // PHASE 2: EXECUTION - Execute the planned movements
          executeMovementPlan(movementPlan, shape1NextIndex, shape2NextIndex)
        }
      }
    })

    // Update shape states
    const morphDuration = 0.3
    const moveDuration = 0.5

    // Update shape 1
    if (shape1State.isMorphing) {
      const morphProgress = Math.min((gameTime - shape1State.morphStartTime) / morphDuration, 1.0)
      const moveProgress = shape1State.isMoving
        ? Math.min((gameTime - shape1State.moveStartTime) / moveDuration, 1.0)
        : 0

      if (morphProgress >= 1.0) {
        setShape1State((prev) => ({
          ...prev,
          currentShapeIndex: prev.targetShapeIndex,
          isMorphing: false,
          morphProgress: 0,
          gridPosition: prev.targetPosition,
          isMoving: false,
          moveProgress: 0,
        }))
      } else {
        setShape1State((prev) => ({
          ...prev,
          morphProgress,
          moveProgress,
        }))
      }
    }

    // Update shape 2
    if (shape2State.isMorphing) {
      const morphProgress = Math.min((gameTime - shape2State.morphStartTime) / morphDuration, 1.0)
      const moveProgress = shape2State.isMoving
        ? Math.min((gameTime - shape2State.moveStartTime) / moveDuration, 1.0)
        : 0

      if (morphProgress >= 1.0) {
        setShape2State((prev) => ({
          ...prev,
          currentShapeIndex: prev.targetShapeIndex,
          isMorphing: false,
          morphProgress: 0,
          gridPosition: prev.targetPosition,
          isMoving: false,
          moveProgress: 0,
        }))
      } else {
        setShape2State((prev) => ({
          ...prev,
          morphProgress,
          moveProgress,
        }))
      }
    }

    // Update mesh positions with movement interpolation
    const shape1WorldPos = getWorldPosition(shape1State.gridPosition)
    const shape1TargetPos = getWorldPosition(shape1State.targetPosition)
    const shape1CurrentPos = shape1State.isMoving
      ? [
          THREE.MathUtils.lerp(shape1WorldPos[0], shape1TargetPos[0], shape1State.moveProgress),
          THREE.MathUtils.lerp(shape1WorldPos[1], shape1TargetPos[1], shape1State.moveProgress),
          shape1WorldPos[2],
        ]
      : shape1WorldPos

    const shape2WorldPos = getWorldPosition(shape2State.gridPosition)
    const shape2TargetPos = getWorldPosition(shape2State.targetPosition)
    const shape2CurrentPos = shape2State.isMoving
      ? [
          THREE.MathUtils.lerp(shape2WorldPos[0], shape2TargetPos[0], shape2State.moveProgress),
          THREE.MathUtils.lerp(shape2WorldPos[1], shape2TargetPos[1], shape2State.moveProgress),
          shape2WorldPos[2],
        ]
      : shape2WorldPos

    mesh1Ref.current.position.set(shape1CurrentPos[0], shape1CurrentPos[1], shape1CurrentPos[2])
    mesh2Ref.current.position.set(shape2CurrentPos[0], shape2CurrentPos[1], shape2CurrentPos[2])

    // Update shader uniforms atomically
    const material1 = mesh1Ref.current.material as THREE.ShaderMaterial
    material1.uniforms.currentShapeType.value = shapes[shape1State.currentShapeIndex].shapeType
    material1.uniforms.targetShapeType.value = shapes[shape1State.targetShapeIndex].shapeType
    material1.uniforms.time.value = state.clock.elapsedTime
    material1.uniforms.isMorphing.value = shape1State.isMorphing ? 1.0 : 0.0
    material1.uniforms.morphProgress.value = shape1State.morphProgress

    const material2 = mesh2Ref.current.material as THREE.ShaderMaterial
    material2.uniforms.currentShapeType.value = shapes[shape2State.currentShapeIndex].shapeType
    material2.uniforms.targetShapeType.value = shapes[shape2State.targetShapeIndex].shapeType
    material2.uniforms.time.value = state.clock.elapsedTime
    material2.uniforms.isMorphing.value = shape2State.isMorphing ? 1.0 : 0.0
    material2.uniforms.morphProgress.value = shape2State.morphProgress
  })

  const shaderMaterial = React.useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        currentShapeType: { value: 0 },
        targetShapeType: { value: 0 },
        time: { value: 0.0 },
        isMorphing: { value: 0.0 },
        morphProgress: { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        uniform float time;
        
        void main() {
          vUv = uv;
          
          // Add subtle floating animation
          vec3 pos = position;
          pos.y += sin(time * 1.5 + position.x * 2.0) * 0.02;
          pos.x += cos(time * 1.2 + position.y * 1.5) * 0.02;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform int currentShapeType;
        uniform int targetShapeType;
        uniform float time;
        uniform float isMorphing;
        uniform float morphProgress;
        varying vec2 vUv;
        
        // SDF functions for different shapes
        float sdCircle(vec2 p, float r) {
          return length(p) - r;
        }
        
        float sdBox(vec2 p, vec2 b) {
          vec2 d = abs(p) - b;
          return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
        }
        
        float sdRoundedBox(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b + r;
          return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
        }
        
        // Get SDF for specific shape type (slightly larger, consistent sizes)
        float getShapeSDF(vec2 p, int shapeType) {
          if (shapeType == 0) return sdCircle(p, 0.22); // Circle - larger
          if (shapeType == 1) return sdBox(p, vec2(0.21, 0.21)); // Square - larger
          if (shapeType == 2) return sdBox(p, vec2(0.21, 0.21)); // Diamond - larger
          if (shapeType == 3) { // Triangle - centered properly
            p.y -= 0.05; // Center the triangle vertically
            float d1 = dot(p, normalize(vec2(0.0, 1.0)));
            float d2 = dot(p, normalize(vec2(0.866, -0.5)));
            float d3 = dot(p, normalize(vec2(-0.866, -0.5)));
            return max(max(d1, d2), d3) - 0.15; // Use larger radius
          }
          if (shapeType == 4) return sdRoundedBox(p, vec2(0.21, 0.21), 0.06); // Hexagon - larger
          if (shapeType == 5) { // Star - larger
            float a = atan(p.y, p.x) + 3.14159;
            float seg = 6.28318 / 5.0;
            float h = cos(floor(0.5 + a / seg) * seg - a) * length(p);
            return h - 0.21;
          }
          return sdCircle(p, 0.21); // Default to circle
        }
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          vec2 p = vUv - center;
          
          // --- SHADOW LAYER ---
          float shadowOffset = 0.0; // No offset, shadow directly under the shape
          float shadowBlur = 0.08;   // How soft the shadow is
          float shadowAlpha = 0.07;  // Lighter shadow opacity
          vec2 shadowP = p;
          shadowP.y -= shadowOffset;
          float currentShadowDist = getShapeSDF(shadowP, currentShapeType);
          float targetShadowDist = getShapeSDF(shadowP, targetShapeType);
          float finalShadowDist = isMorphing > 0.5 ? 
            mix(currentShadowDist, targetShadowDist, morphProgress) : 
            currentShadowDist;
          float shadow = 1.0 - smoothstep(-shadowBlur, shadowBlur, finalShadowDist);
          
          // --- SHAPE LAYER ---
          float currentDist = getShapeSDF(p, currentShapeType);
          float targetDist = getShapeSDF(p, targetShapeType);
          float finalDist = isMorphing > 0.5 ? 
            mix(currentDist, targetDist, morphProgress) : 
            currentDist;
          float shape = 1.0 - smoothstep(-0.01, 0.01, finalDist);
          
          // Lighter amber color - warm golden tone (consistent during morphing)
          vec3 shapeColor = vec3(1.0, 0.9, 0.6);
          float opacity = shape * 0.7; // Consistent opacity, no morph boost
          
          // --- COMPOSITE ---
          vec3 shadowColor = vec3(0.0, 0.0, 0.0); // Black shadow
          float shadowLayer = shadow * shadowAlpha;
          float shapeLayer = opacity;
          // Standard alpha compositing: shape over shadow
          float finalAlpha = shapeLayer + shadowLayer * (1.0 - shapeLayer);
          vec3 finalColor = (shapeColor * shapeLayer + shadowColor * shadowLayer * (1.0 - shapeLayer)) / (finalAlpha + 1e-5);
          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending, // Changed from Additive to Normal to prevent overlapping issues
      depthWrite: false, // Prevent depth writing for proper transparency
    })
  }, [])

  return (
    <>
      <mesh ref={mesh1Ref}>
        <planeGeometry args={[1.9, 1.9]} />
        <primitive object={shaderMaterial.clone()} />
      </mesh>
      <mesh ref={mesh2Ref}>
        <planeGeometry args={[1.9, 1.9]} />
        <primitive object={shaderMaterial.clone()} />
      </mesh>
    </>
  )
}
