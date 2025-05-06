import React, { useMemo, useCallback, useEffect, useState, useRef } from 'react'
import { useMotionValue } from 'framer-motion'
import { PixelArtAnimationProps, SquareState, Point } from './types'
import {
  generateRandomValue,
  generateVelocity,
  getRotatedCorners,
  handleEdgeWrapping,
  checkCollision,
} from './utils'
import {
  MAX_SQUARES,
  VELOCITY_DAMPING,
  IMPACT_DURATION,
  FLASH_DURATION,
  DEFAULT_COLORS,
} from './constants'
import { DebugOverlay } from './DebugOverlay'

/**
 * PixelArtAnimation.tsx
 *
 * This component renders a performant, interactive pixel-art style background animation
 * with moving, colliding squares. It is designed for use as a visually rich, non-blocking
 * background effect in a Next.js/React application.
 *
 * ---
 *
 * ## Physics & Animation Logic
 *
 * - **Square Motion**: Each square has position, velocity, rotation, and angular velocity.
 *   - Positions and velocities are updated each animation frame using a time-based (deltaTime) approach for smooth, frame-rate-independent motion.
 *   - Velocity damping is applied to simulate friction/air resistance.
 *   - Edge wrapping is used: when a square moves off one edge, it reappears on the opposite side.
 *
 * - **Collision Detection**: Uses Separating Axis Theorem (SAT) for accurate detection between rotated squares.
 *   - Each square's corners are recalculated based on its center, size, and rotation.
 *   - For each pair of potentially colliding squares, SAT is used to check for overlap and compute the collision normal and overlap depth.
 *
 * - **Collision Response**: When a collision is detected:
 *   - Velocities are exchanged using a simple impulse-based response, conserving momentum.
 *   - Angular velocities are partially transferred to simulate rotational effects.
 *   - Positions are corrected to resolve overlap.
 *   - Impact points and normals are recorded for debug/visualization.
 *
 * ---
 *
 * ## Efficiency Techniques
 *
 * - **Spatial Partitioning**: The screen is divided into a grid (cells sized to fit the largest square). Each square is assigned to one or more cells. Only squares in the same or adjacent cells are checked for collisions, reducing the number of collision checks from O(n^2) to nearly O(n).
 *
 * - **Early Rejection**: Before running SAT, a quick distance check is performed to skip pairs that are obviously too far apart to collide.
 *
 * - **Delta Time Animation**: All motion and physics are scaled by the actual time elapsed between frames, ensuring smooth and consistent animation regardless of frame rate.
 *
 * - **Memoization & React.memo**: Components and arrays are memoized to avoid unnecessary recalculations and re-renders. The Square component is memoized for optimal React rendering.
 *
 * - **Pointer Events**: The animation layer uses pointer-events: none, so it never blocks user interaction with the rest of the site.
 *
 * - **Debug Overlay**: When enabled, a separate SVG overlay is rendered above each square, showing hitboxes, velocity vectors, and other physics data for development and tuning.
 *
 * ---
 *
 * This approach allows for visually rich, interactive, and physically accurate background effects that remain performant even with many moving objects.
 */
const PixelArtAnimation: React.FC<PixelArtAnimationProps> = ({
  numSquares = 20,
  sizeRange = [10, 25],
  colors = DEFAULT_COLORS,
  interactionDistance = 150,
  className = '',
  opacity = 1,
  debug = false,
}) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [squareStates, setSquareStates] = useState<SquareState[]>([])
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Use a ref for tracking animation frame
  const animationFrameIdRef = useRef<number | null>(null)

  // Use a ref for tracking the last update time for deltaTime calculations
  const lastUpdateTimeRef = useRef<number>(0)

  // Use a ref for viewport dimensions to avoid unnecessary re-renders
  const viewportDimensionsRef = useRef({ width: 0, height: 0 })

  // Create x position motion values at the component level
  const x0 = useMotionValue(0)
  const x1 = useMotionValue(0)
  const x2 = useMotionValue(0)
  const x3 = useMotionValue(0)
  const x4 = useMotionValue(0)
  const x5 = useMotionValue(0)
  const x6 = useMotionValue(0)
  const x7 = useMotionValue(0)
  const x8 = useMotionValue(0)
  const x9 = useMotionValue(0)
  const x10 = useMotionValue(0)
  const x11 = useMotionValue(0)
  const x12 = useMotionValue(0)
  const x13 = useMotionValue(0)
  const x14 = useMotionValue(0)
  const x15 = useMotionValue(0)
  const x16 = useMotionValue(0)
  const x17 = useMotionValue(0)
  const x18 = useMotionValue(0)
  const x19 = useMotionValue(0)

  // Create y position motion values
  const y0 = useMotionValue(0)
  const y1 = useMotionValue(0)
  const y2 = useMotionValue(0)
  const y3 = useMotionValue(0)
  const y4 = useMotionValue(0)
  const y5 = useMotionValue(0)
  const y6 = useMotionValue(0)
  const y7 = useMotionValue(0)
  const y8 = useMotionValue(0)
  const y9 = useMotionValue(0)
  const y10 = useMotionValue(0)
  const y11 = useMotionValue(0)
  const y12 = useMotionValue(0)
  const y13 = useMotionValue(0)
  const y14 = useMotionValue(0)
  const y15 = useMotionValue(0)
  const y16 = useMotionValue(0)
  const y17 = useMotionValue(0)
  const y18 = useMotionValue(0)
  const y19 = useMotionValue(0)

  // Create rotation motion values
  const r0 = useMotionValue(0)
  const r1 = useMotionValue(0)
  const r2 = useMotionValue(0)
  const r3 = useMotionValue(0)
  const r4 = useMotionValue(0)
  const r5 = useMotionValue(0)
  const r6 = useMotionValue(0)
  const r7 = useMotionValue(0)
  const r8 = useMotionValue(0)
  const r9 = useMotionValue(0)
  const r10 = useMotionValue(0)
  const r11 = useMotionValue(0)
  const r12 = useMotionValue(0)
  const r13 = useMotionValue(0)
  const r14 = useMotionValue(0)
  const r15 = useMotionValue(0)
  const r16 = useMotionValue(0)
  const r17 = useMotionValue(0)
  const r18 = useMotionValue(0)
  const r19 = useMotionValue(0)

  // Create arrays of motion values - using the original approach but limiting to numSquares
  const xMotionValues = useMemo(
    () =>
      [
        x0,
        x1,
        x2,
        x3,
        x4,
        x5,
        x6,
        x7,
        x8,
        x9,
        x10,
        x11,
        x12,
        x13,
        x14,
        x15,
        x16,
        x17,
        x18,
        x19,
      ].slice(0, Math.min(numSquares, MAX_SQUARES)),
    [
      numSquares,
      x0,
      x1,
      x2,
      x3,
      x4,
      x5,
      x6,
      x7,
      x8,
      x9,
      x10,
      x11,
      x12,
      x13,
      x14,
      x15,
      x16,
      x17,
      x18,
      x19,
    ],
  )

  const yMotionValues = useMemo(
    () =>
      [
        y0,
        y1,
        y2,
        y3,
        y4,
        y5,
        y6,
        y7,
        y8,
        y9,
        y10,
        y11,
        y12,
        y13,
        y14,
        y15,
        y16,
        y17,
        y18,
        y19,
      ].slice(0, Math.min(numSquares, MAX_SQUARES)),
    [
      numSquares,
      y0,
      y1,
      y2,
      y3,
      y4,
      y5,
      y6,
      y7,
      y8,
      y9,
      y10,
      y11,
      y12,
      y13,
      y14,
      y15,
      y16,
      y17,
      y18,
      y19,
    ],
  )

  const rMotionValues = useMemo(
    () =>
      [
        r0,
        r1,
        r2,
        r3,
        r4,
        r5,
        r6,
        r7,
        r8,
        r9,
        r10,
        r11,
        r12,
        r13,
        r14,
        r15,
        r16,
        r17,
        r18,
        r19,
      ].slice(0, Math.min(numSquares, MAX_SQUARES)),
    [
      numSquares,
      r0,
      r1,
      r2,
      r3,
      r4,
      r5,
      r6,
      r7,
      r8,
      r9,
      r10,
      r11,
      r12,
      r13,
      r14,
      r15,
      r16,
      r17,
      r18,
      r19,
    ],
  )

  /**
   * Calculates a grid position for a square based on its index, total number of squares, and padding.
   * Ensures squares are distributed in a grid and spaced to minimize overlap.
   * Uses memoization to avoid redundant calculations for grid size and cell size.
   */
  const calculateGridPosition = useCallback(
    (() => {
      // Cache for columns and cell size to avoid redundant calculations
      let lastTotal = -1
      let lastPadding = -1
      let lastCols = 0
      let lastCellSize = 0
      let lastMaxSquareSize = 0

      return (index: number, total: number, padding: number = 25) => {
        // Only recalculate if total, padding, or maxSquareSize changes
        const maxSquareSize = sizeRange[1]
        if (total !== lastTotal || padding !== lastPadding || maxSquareSize !== lastMaxSquareSize) {
          lastCols = Math.ceil(Math.sqrt(total))
          const minCellSize = maxSquareSize * 2
          lastCellSize = Math.max((100 - padding * 2) / lastCols, minCellSize)
          lastTotal = total
          lastPadding = padding
          lastMaxSquareSize = maxSquareSize
        }

        const row = Math.floor(index / lastCols)
        const col = index % lastCols

        // Minimize calls to generateRandomValue by using a single offset value
        const offsetX = generateRandomValue(-3, 3)
        const offsetY = generateRandomValue(-3, 3)

        return {
          x: padding + col * lastCellSize + offsetX,
          y: padding + row * lastCellSize + offsetY,
        }
      }
    })(),
    [sizeRange],
  )

  /**
   * Initializes the array of square objects with randomized size, color, velocity, and rotation.
   * Each square is assigned a unique id and physical properties for simulation.
   */
  const squares = useMemo(() => {
    return Array.from({ length: Math.min(numSquares, MAX_SQUARES) }).map((_, index) => {
      const velocity = generateVelocity()
      const size = generateRandomValue(sizeRange[0], sizeRange[1])
      const mass = size * size
      const inertia = (mass * size * size) / 12

      return {
        id: index,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocityX: velocity.x,
        velocityY: velocity.y,
        rotation: velocity.initialRotation,
        angularVelocity: velocity.angularVelocity,
        mass,
        inertia,
        corners: [],
        isTransitioning: false,
        opacity: 1,
        collisionCoolDown: new Map<number, number>(),
        lastCollision: undefined,
        centerX: 0,
        centerY: 0,
      }
    })
  }, [numSquares, sizeRange, colors])

  /**
   * Divides the screen into a grid of cells for efficient collision detection (spatial partitioning).
   * Each square is assigned to one or more cells based on its position, so only nearby squares are checked for collisions.
   * Returns a map from cell key to array of square indices.
   */
  const spatialPartitioning = useCallback(
    (states: SquareState[]) => {
      const cellSize = Math.max(...sizeRange) * 2 // Cell size based on maximum square size
      const grid: Map<string, number[]> = new Map()

      // Place each square in the appropriate cell(s)
      states.forEach((state, index) => {
        const cellX = Math.floor(state.centerX / cellSize)
        const cellY = Math.floor(state.centerY / cellSize)

        // A square might span multiple cells, so add to adjacent cells if needed
        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            const key = `${cellX + x},${cellY + y}`
            if (!grid.has(key)) {
              grid.set(key, [])
            }
            grid.get(key)?.push(index)
          }
        }
      })

      return grid
    },
    [sizeRange],
  )

  /**
   * For each square, finds all potential collision pairs using the spatial partitioning grid.
   * Only checks pairs in the same cell, and ensures each pair is only checked once.
   * Returns an array of [i, j] index pairs for collision checking.
   */
  const detectCollisions = useCallback(
    (states: SquareState[], grid: Map<string, number[]>) => {
      const collisionPairs: [number, number][] = []
      const cellSize = Math.max(...sizeRange) * 2

      states.forEach((state, i) => {
        const cellX = Math.floor(state.centerX / cellSize)
        const cellY = Math.floor(state.centerY / cellSize)
        const key = `${cellX},${cellY}`

        const potentialColliders = grid.get(key) || []
        potentialColliders.forEach((j) => {
          // Ensure we check each pair only once and don't check against self
          if (i < j) {
            collisionPairs.push([i, j])
          }
        })
      })

      return collisionPairs
    },
    [sizeRange],
  )

  /**
   * Handles the collision response between two squares if they are colliding.
   * Uses a quick distance check for early rejection, then SAT for precise collision detection.
   * Applies impulse-based velocity exchange, angular velocity transfer, and position correction.
   * Records impact points and normals for debug visualization.
   * Returns true if a collision occurred, false otherwise.
   */
  const handleCollision = useCallback(
    (square1: SquareState, square2: SquareState, xValues: any[], yValues: any[]) => {
      // Quick distance check before doing expensive collision detection
      const dx = square1.centerX - square2.centerX
      const dy = square1.centerY - square2.centerY
      const distanceSquared = dx * dx + dy * dy
      const minDistance = (square1.size + square2.size) / 2

      // Skip if definitely too far apart
      if (distanceSquared > minDistance * minDistance * 1.5) {
        return false
      }

      const corners1 = getRotatedCorners(
        xValues[square1.id].get(),
        yValues[square1.id].get(),
        square1.size,
        square1.rotation,
      )

      const corners2 = getRotatedCorners(
        xValues[square2.id].get(),
        yValues[square2.id].get(),
        square2.size,
        square2.rotation,
      )

      // Pre-calculate centers for optimization
      const center1 = {
        x: xValues[square1.id].get(),
        y: yValues[square1.id].get(),
      }

      const center2 = {
        x: xValues[square2.id].get(),
        y: yValues[square2.id].get(),
      }

      const collision = checkCollision(corners1, corners2, center1, center2)

      if (collision.collides && collision.normal) {
        // Velocity exchange
        const totalMass = square1.mass + square2.mass
        const impulse =
          (2 *
            (square1.velocityX * collision.normal.x +
              square1.velocityY * collision.normal.y -
              square2.velocityX * collision.normal.x -
              square2.velocityY * collision.normal.y)) /
          totalMass

        square1.velocityX -= impulse * square2.mass * collision.normal.x
        square1.velocityY -= impulse * square2.mass * collision.normal.y
        square2.velocityX += impulse * square1.mass * collision.normal.x
        square2.velocityY += impulse * square1.mass * collision.normal.y

        // Position correction
        const overlap = collision.overlap || 0 // Default to 0 if undefined
        const correction = overlap * 0.5
        xValues[square1.id].set(xValues[square1.id].get() - collision.normal.x * correction)
        yValues[square1.id].set(yValues[square1.id].get() - collision.normal.y * correction)
        xValues[square2.id].set(xValues[square2.id].get() + collision.normal.x * correction)
        yValues[square2.id].set(yValues[square2.id].get() + collision.normal.y * correction)

        // Rotation transfer
        const transfer = 0.4 * Math.min(square1.angularVelocity, square2.angularVelocity)

        if (Math.abs(square1.angularVelocity) > Math.abs(square2.angularVelocity)) {
          square1.angularVelocity -= transfer
          square2.angularVelocity += transfer
        } else {
          square1.angularVelocity += transfer
          square2.angularVelocity -= transfer
        }

        // Calculate impact point (average of centers)
        const impactPoint = {
          x:
            (corners1.reduce((sum, p) => sum + p.x, 0) / 4 +
              corners2.reduce((sum, p) => sum + p.x, 0) / 4) /
            2,
          y:
            (corners1.reduce((sum, p) => sum + p.y, 0) / 4 +
              corners2.reduce((sum, p) => sum + p.y, 0) / 4) /
            2,
        }

        // Set collision timestamps
        const now = Date.now()
        // Update lastCollision for both squares
        square1.lastCollision = {
          point: impactPoint,
          normal: collision.normal,
          timestamp: now,
        }
        square2.lastCollision = {
          point: impactPoint,
          normal: collision.normal,
          timestamp: now,
        }

        // Set flash timestamps
        square1.flashTimestamp = now

        return true
      }

      return false
    },
    [],
  )

  /**
   * Main animation effect: runs the animation loop, updates positions, handles collisions, and cleans up old impacts.
   * Uses requestAnimationFrame for smooth updates and deltaTime for frame-rate independence.
   * Also handles window resize events and viewport dimension tracking.
   */
  useEffect(() => {
    if (!containerRef.current) return

    // Update viewport dimensions initially
    const updateViewportSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        viewportDimensionsRef.current = {
          width: rect.width,
          height: rect.height,
        }
      }
    }

    updateViewportSize()

    // Add resize listener
    window.addEventListener('resize', updateViewportSize)

    // Impact effect cleanup function - rewritten to be more efficient
    const cleanOldImpacts = (states: SquareState[]) => {
      const now = Date.now()
      states.forEach((square) => {
        if (square.lastCollision && now - square.lastCollision.timestamp > IMPACT_DURATION) {
          square.lastCollision = undefined
        }
        if (square.flashTimestamp && now - square.flashTimestamp > FLASH_DURATION) {
          square.flashTimestamp = undefined
        }
      })
    }

    const updatePositions = (timestamp: number) => {
      if (!containerRef.current) return

      // Calculate delta time for smoother animation
      const deltaTime = lastUpdateTimeRef.current ? (timestamp - lastUpdateTimeRef.current) / 16 : 1
      lastUpdateTimeRef.current = timestamp

      // Get viewport dimensions from ref
      const { width: viewportWidth, height: viewportHeight } = viewportDimensionsRef.current

      setSquareStates((prevStates) => {
        const updatedStates = prevStates.map((state, i) => ({
          ...state,
        }))

        // Update positions and rotations first
        updatedStates.forEach((state, i) => {
          // Keep existing collision data unless updated
          const prevState = prevStates[i]
          state.lastCollision = prevState.lastCollision

          // Apply damping scaled by deltaTime for consistent behavior
          const scaledDamping = Math.pow(VELOCITY_DAMPING, deltaTime)
          state.velocityX *= scaledDamping
          state.velocityY *= scaledDamping

          // Hard velocity limits
          state.velocityX = Math.max(-25, Math.min(25, state.velocityX))
          state.velocityY = Math.max(-25, Math.min(25, state.velocityY))

          // Angular velocity limits
          state.angularVelocity = Math.max(-5, Math.min(5, state.angularVelocity))

          // Scale rotation by deltaTime
          state.rotation += state.angularVelocity * deltaTime

          // Keep rotation in 0-360 range to prevent values from growing too large
          state.rotation = state.rotation % 360
          if (state.rotation < 0) state.rotation += 360

          // Update rotation motion value in degrees
          rMotionValues[i].set(state.rotation)

          let currentX = xMotionValues[i].get()
          let currentY = yMotionValues[i].get()

          // Apply velocities scaled by deltaTime
          currentX += state.velocityX * deltaTime
          currentY += state.velocityY * deltaTime

          // Handle edge wrapping
          const wrappedPos = handleEdgeWrapping(
            currentX,
            currentY,
            state.size,
            viewportWidth,
            viewportHeight,
          )

          // Update motion values and corners
          xMotionValues[i].set(wrappedPos.x)
          yMotionValues[i].set(wrappedPos.y)

          // Store actual center coordinates
          state.centerX = wrappedPos.x
          state.centerY = wrappedPos.y

          // Update corners with correct center - only when needed for collision detection
          // This happens later in the collision detection phase

          // Cooldown handling
          state.collisionCoolDown.forEach((value, key) => {
            const newValue = Math.max(0, value - deltaTime)
            if (newValue <= 0) {
              state.collisionCoolDown.delete(key)
            } else {
              state.collisionCoolDown.set(key, newValue)
            }
          })
        })

        // Apply spatial partitioning for optimized collision detection
        const grid = spatialPartitioning(updatedStates)
        const collisionPairs = detectCollisions(updatedStates, grid)

        // Handle collisions using the potential pairs
        collisionPairs.forEach(([i, j]) => {
          // Only update corners when we need to check for collisions
          if (!updatedStates[i].corners || updatedStates[i].corners.length !== 4) {
            updatedStates[i].corners = getRotatedCorners(
              updatedStates[i].centerX,
              updatedStates[i].centerY,
              updatedStates[i].size,
              updatedStates[i].rotation,
            )
          }

          if (!updatedStates[j].corners || updatedStates[j].corners.length !== 4) {
            updatedStates[j].corners = getRotatedCorners(
              updatedStates[j].centerX,
              updatedStates[j].centerY,
              updatedStates[j].size,
              updatedStates[j].rotation,
            )
          }

          handleCollision(updatedStates[i], updatedStates[j], xMotionValues, yMotionValues)
        })

        cleanOldImpacts(updatedStates) // Clean old impacts each frame

        return updatedStates
      })

      animationFrameIdRef.current = requestAnimationFrame(updatePositions)
    }

    lastUpdateTimeRef.current = performance.now()
    animationFrameIdRef.current = requestAnimationFrame(updatePositions)

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
      window.removeEventListener('resize', updateViewportSize)
    }
  }, [
    handleCollision,
    spatialPartitioning,
    detectCollisions,
    rMotionValues,
    xMotionValues,
    yMotionValues,
  ])

  /**
   * Initializes the squares' positions and sets up the initial state when the component mounts or when dependencies change.
   * Ensures squares are placed without overlapping and updates the viewport dimensions reference.
   */
  useEffect(() => {
    if (!containerRef.current) return

    const initializeSquares = () => {
      const rect = containerRef.current!.getBoundingClientRect()
      const viewportWidth = rect.width
      const viewportHeight = rect.height

      // Store viewport dimensions in ref
      viewportDimensionsRef.current = {
        width: viewportWidth,
        height: viewportHeight,
      }

      // Generate non-overlapping positions
      const positions: Point[] = []
      const placedSquares: SquareState[] = []

      squares.forEach((square) => {
        let attempts = 0
        let position: Point = { x: 0, y: 0 }
        let collides = true

        while (collides && attempts < 100) {
          const gridPos = calculateGridPosition(positions.length, numSquares)
          position = {
            x: (gridPos.x / 100) * viewportWidth + square.size / 2,
            y: (gridPos.y / 100) * viewportHeight + square.size / 2,
          }

          collides = placedSquares.some((existing) => {
            const dx = position.x - existing.initialX
            const dy = position.y - existing.initialY
            return Math.sqrt(dx * dx + dy * dy) < (square.size + existing.size) / 2
          })

          attempts++
        }

        positions.push(position)
        placedSquares.push({
          ...square,
          initialX: position.x,
          initialY: position.y,
          corners: getRotatedCorners(position.x, position.y, square.size, square.rotation),
          collisionCoolDown: new Map<number, number>(),
          centerX: position.x,
          centerY: position.y,
        })
      })

      // Set initial positions
      positions.forEach((pos, i) => {
        xMotionValues[i].set(pos.x)
        yMotionValues[i].set(pos.y)
        rMotionValues[i].set(squares[i].rotation) // Initialize rotation value
      })

      setSquareStates(placedSquares)

      // Delay setting isInitialized to ensure DOM has time to update
      setTimeout(() => {
        setIsInitialized(true)
      }, 100)
    }

    initializeSquares()
  }, [
    containerRef,
    numSquares,
    squares,
    xMotionValues,
    yMotionValues,
    rMotionValues,
    calculateGridPosition,
  ])

  // Use React.memo for optimized rendering of each square
  const Square = React.memo(
    ({
      square,
      state,
      index,
      xMotionVal,
      yMotionVal,
      rMotionVal,
      opacity,
    }: {
      square: any
      state: SquareState
      index: number
      xMotionVal: any
      yMotionVal: any
      rMotionVal: any
      opacity: number
    }) => {
      if (!state || !state.corners || state.corners.length !== 4) return null

      // Ensure values are valid
      const size = Math.max(5, square.size)
      const posLeft = state.centerX - size / 2
      const posTop = state.centerY - size / 2

      return (
        <React.Fragment>
          {/* Render the square first */}
          <div
            style={{
              position: 'absolute',
              width: `${size}px`,
              height: `${size}px`,
              left: `${posLeft}px`,
              top: `${posTop}px`,
              backgroundColor: square.color,
              transform: `rotate(${state.rotation}deg)`,
              transformOrigin: 'center center',
              boxShadow: `
                inset -2px -2px 0 rgba(0,0,0,0.2),
                inset 2px 2px 0 rgba(255,255,255,0.2)
              `,
              opacity: isInitialized ? opacity : 0,
              transition: `opacity 0.5s ease ${index * 0.05}s`,
              willChange: 'transform',
              zIndex: 5,
            }}
          />

          {/* Render the debug overlay after the square so it appears on top */}
          {debug && (
            <DebugOverlay
              state={state}
              impactProgress={
                state?.lastCollision
                  ? Math.max(0, 1 - (Date.now() - state.lastCollision.timestamp) / IMPACT_DURATION)
                  : 0
              }
            />
          )}
        </React.Fragment>
      )
    },
  )

  // Add debug feedback if needed
  React.useEffect(() => {
    if (debug) {
      console.log('Animation state:', {
        isInitialized,
        squareCount: squareStates.length,
        viewportDimensions: viewportDimensionsRef.current,
      })
    }
  }, [debug, isInitialized, squareStates.length])

  return (
    squares.length <= MAX_SQUARES && (
      <div
        ref={containerRef}
        className={`fixed inset-0 w-screen h-screen overflow-hidden ${className}`}
        style={{
          position: 'relative',
          zIndex: 1,
          background: debug ? 'rgba(0,0,0,0.05)' : 'transparent',
          pointerEvents: 'none', // Allow clicks to pass through the container
        }}
      >
        {/* Force a non-zero size for the container */}
        <div style={{ width: '100%', height: '100%', minHeight: '100px', minWidth: '100px' }} />

        {squareStates.map((state, i) => (
          <Square
            key={squares[i].id}
            square={squares[i]}
            state={state}
            index={i}
            xMotionVal={xMotionValues[i]}
            yMotionVal={yMotionValues[i]}
            rMotionVal={rMotionValues[i]}
            opacity={opacity}
          />
        ))}

        {/* Add a small debug indicator in corner if needed */}
        {debug && (
          <div
            className="fixed bottom-1 right-1 text-xs"
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              padding: '1px 3px',
              borderRadius: '2px',
              pointerEvents: 'none',
            }}
          >
            DEBUG MODE - ON
          </div>
        )}
      </div>
    )
  )
}

export default React.memo(PixelArtAnimation)
