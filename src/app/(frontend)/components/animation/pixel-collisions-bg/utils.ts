import { Point } from './types'
// Constants are now imported from constants.ts

/**
 * Generates a random floating-point number between min (inclusive) and max (exclusive).
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (exclusive)
 * @returns A random number in the range [min, max)
 */
export const generateRandomValue = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

/**
 * Generates a random velocity vector and angular velocity for a square.
 * @returns An object containing x, y velocity, angular velocity, and initial rotation (degrees)
 */
export const generateVelocity = () => {
  const angle = Math.random() * Math.PI * 2
  const speed = generateRandomValue(2, 4)
  const angularVelocity = generateRandomValue(-2, 2)
  return {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed,
    angularVelocity,
    initialRotation: Math.random() * 360,
  }
}

/**
 * Calculates the four corners of a square after rotation around its center.
 * @param centerX - The x coordinate of the square's center
 * @param centerY - The y coordinate of the square's center
 * @param size - The length of the square's sides
 * @param rotation - The rotation angle in degrees
 * @returns An array of 4 Points representing the rotated corners in order (TL, TR, BR, BL)
 */
export const getRotatedCorners = (
  centerX: number,
  centerY: number,
  size: number,
  rotation: number,
): Point[] => {
  const half = size / 2
  const rad = (rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  // Define corners relative to center
  const corners = [
    { x: -half, y: -half }, // Top-left
    { x: half, y: -half }, // Top-right
    { x: half, y: half }, // Bottom-right
    { x: -half, y: half }, // Bottom-left
  ]

  // Apply rotation matrix and translate to actual position
  return corners.map((corner) => ({
    x: centerX + (corner.x * cos - corner.y * sin),
    y: centerY + (corner.x * sin + corner.y * cos),
  }))
}

/**
 * Handles edge wrapping for a square: if it moves off one edge of the viewport, it reappears on the opposite side.
 * @param currentX - Current x position (center)
 * @param currentY - Current y position (center)
 * @param size - Size of the square
 * @param viewportWidth - Width of the viewport
 * @param viewportHeight - Height of the viewport
 * @returns The new (possibly wrapped) x and y coordinates
 */
export const handleEdgeWrapping = (
  currentX: number,
  currentY: number,
  size: number,
  viewportWidth: number,
  viewportHeight: number,
): { x: number; y: number } => {
  const buffer = size * 1.2 // Size-based buffer instead of fixed 5px
  const halfSize = size / 2
  let newX = currentX
  let newY = currentY

  if (currentX - halfSize > viewportWidth + buffer) newX = -halfSize - buffer
  else if (currentX + halfSize < -buffer) newX = viewportWidth + halfSize + buffer

  if (currentY - halfSize > viewportHeight + buffer) newY = -halfSize - buffer
  else if (currentY + halfSize < -buffer) newY = viewportHeight + halfSize + buffer

  return { x: newX, y: newY }
}

/**
 * Normalizes a 2D vector (scales it to length 1).
 * @param v - The vector to normalize
 * @returns The normalized vector, or (0,0) if input is zero-length
 */
export const normalize = (v: Point): Point => {
  const length = Math.sqrt(v.x * v.x + v.y * v.y)
  // Handle potential division by zero if length is 0
  if (length === 0) return { x: 0, y: 0 }
  return {
    x: v.x / length,
    y: v.y / length,
  }
}

/**
 * Returns the two unique normalized axes (normals) for a rectangle's edges, for SAT collision detection.
 * @param corners - The four corners of the rectangle, in order
 * @returns An array of 2 normalized axis vectors (as Points)
 */
export const getAxes = (corners: Point[]): Point[] => {
  const axes: Point[] = []
  // Only need 2 unique axes for a rectangle/square
  for (let i = 0; i < 2; i++) {
    const j = (i + 1) % corners.length
    const edge = {
      x: corners[j].x - corners[i].x,
      y: corners[j].y - corners[i].y,
    }
    // Get perpendicular axis (normal) and normalize
    axes.push(
      normalize({
        x: -edge.y,
        y: edge.x,
      }),
    )
  }
  return axes
}

/**
 * Projects a set of points (corners) onto an axis for SAT collision detection.
 * @param axis - The axis to project onto (should be normalized)
 * @param corners - The points to project
 * @returns The min and max scalar projections along the axis
 */
export const project = (axis: Point, corners: Point[]): { min: number; max: number } => {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY

  for (const corner of corners) {
    const projection = corner.x * axis.x + corner.y * axis.y
    min = Math.min(min, projection)
    max = Math.max(max, projection)
  }

  return { min, max }
}

/**
 * Checks for collision between two convex polygons (rectangles/squares) using the Separating Axis Theorem (SAT).
 * Accepts pre-calculated corners and optionally centers for both shapes.
 * @param a - Corners of shape A
 * @param b - Corners of shape B
 * @param centerA - (Optional) Center of shape A
 * @param centerB - (Optional) Center of shape B
 * @returns An object: { collides: boolean, normal?: Point, overlap?: number }
 *   - If collides is true, normal is the collision normal (direction), and overlap is the penetration depth.
 */
export const checkCollision = (a: Point[], b: Point[], centerA?: Point, centerB?: Point) => {
  // Get normalized axes for both shapes (only 2 unique axes per rectangle)
  const axesA = getAxes(a)
  const axesB = getAxes(b)
  const allAxes = [...axesA, ...axesB]

  let overlap = Infinity
  let smallestAxis = { x: 0, y: 0 }

  for (const axis of allAxes) {
    const projA = project(axis, a)
    const projB = project(axis, b)

    if (projA.max < projB.min || projB.max < projA.min) return { collides: false }

    const o = Math.min(projA.max - projB.min, projB.max - projA.min)
    if (o < overlap) {
      overlap = o
      smallestAxis = axis
    }
  }

  // Calculate centers if not provided
  const calculatedCenterA =
    centerA ||
    a.reduce(
      (acc, p) => ({
        x: acc.x + p.x / 4,
        y: acc.y + p.y / 4,
      }),
      { x: 0, y: 0 },
    )

  const calculatedCenterB =
    centerB ||
    b.reduce(
      (acc, p) => ({
        x: acc.x + p.x / 4,
        y: acc.y + p.y / 4,
      }),
      { x: 0, y: 0 },
    )

  // Ensure correct collision normal direction
  const dir = {
    x: calculatedCenterB.x - calculatedCenterA.x,
    y: calculatedCenterB.y - calculatedCenterA.y,
  }

  if (dir.x * smallestAxis.x + dir.y * smallestAxis.y < 0) {
    smallestAxis = { x: -smallestAxis.x, y: -smallestAxis.y }
  }

  return { collides: true, normal: smallestAxis, overlap }
}
