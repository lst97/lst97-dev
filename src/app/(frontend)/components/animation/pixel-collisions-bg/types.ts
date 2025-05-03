export interface PixelArtAnimationProps {
  numSquares?: number
  sizeRange?: [number, number]
  colors?: string[]
  interactionDistance?: number
  className?: string
  opacity?: number
  debug?: boolean
}

export interface Point {
  x: number
  y: number
}

export interface SquareState {
  id: number
  size: number
  color: string
  velocityX: number
  velocityY: number
  rotation: number
  angularVelocity: number
  mass: number
  inertia: number
  corners: Point[]
  isTransitioning: boolean
  opacity: number
  initialX: number
  initialY: number
  lastCollision?: {
    point: Point
    normal: Point
    timestamp: number
  }
  collisionCoolDown: Map<number, number>
  centerX: number
  centerY: number
  flashTimestamp?: number
}

export interface CollisionResult {
  hasCollision: boolean
  point?: Point
  normal?: Point
  penetration?: number
}
