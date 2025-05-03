import React from 'react'
import { SquareState } from './types'

interface DebugOverlayProps {
  state: SquareState
  impactProgress: number
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({ state, impactProgress }) => {
  // Calculate center from corners
  const centerX = state.centerX
  const centerY = state.centerY

  return (
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 20, // Increased z-index to ensure visibility
      }}
    >
      {/* Velocity Vector */}
      <line
        x1={centerX}
        y1={centerY}
        x2={centerX + state.velocityX * 15} // 15x magnification for visibility
        y2={centerY + state.velocityY * 15}
        stroke="cyan"
        strokeWidth="2"
        opacity="0.9"
      />

      {/* Velocity Magnitude Text */}
      <text
        x={centerX + 20}
        y={centerY + 15}
        fontSize="16"
        fill="#00FF00"
        fontFamily="monospace"
        fontWeight="bold"
        style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}
      >
        {`V: ${Math.hypot(state.velocityX, state.velocityY).toFixed(2)} px/frame`}
      </text>

      {/* Angular Velocity Display */}
      <text
        x={centerX + 20}
        y={centerY - 5}
        fontSize="16"
        fill="#FF00FF"
        fontFamily="monospace"
        fontWeight="bold"
        style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}
      >
        {`ω: ${state.angularVelocity.toFixed(2)} rad/frame`}
      </text>

      {/* Rotation Indicator */}
      <path
        d={`M ${centerX} ${centerY} L ${centerX + 20} ${centerY} Z`}
        stroke="black"
        strokeWidth="2"
        transform={`rotate(${state.rotation}, ${centerX}, ${centerY})`}
      />

      {/* Velocity Components */}
      <text
        x={centerX - 40}
        y={centerY + 30}
        fontSize="14"
        fill="#00FFFF"
        fontFamily="monospace"
        style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}
      >
        {`Vx: ${state.velocityX.toFixed(2)}`}
      </text>
      <text
        x={centerX - 40}
        y={centerY + 45}
        fontSize="14"
        fill="#00FFFF"
        fontFamily="monospace"
        style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}
      >
        {`Vy: ${state.velocityY.toFixed(2)}`}
      </text>

      {/* Hitbox visualization - draw 2 polygons for better visibility */}
      <polygon
        points={state.corners.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="black"
        strokeWidth="3"
        opacity="0.9"
      />
      <polygon
        points={state.corners.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="#00FF00"
        strokeWidth="2"
        opacity="1" // Full opacity for better visibility
      />

      {/* Center marker */}
      <circle
        cx={state.centerX}
        cy={state.centerY}
        r="3"
        fill="yellow"
        stroke="black"
        strokeWidth="1"
      />

      {/* Impact Point Visualization */}
      {state.lastCollision && (
        <>
          {/* Pulsing effect */}
          <circle
            cx={state.lastCollision.point.x}
            cy={state.lastCollision.point.y}
            r={4 * (1 + impactProgress)}
            fill="none"
            stroke="red"
            strokeWidth="2"
            opacity={impactProgress}
          />

          {/* Normal vector indicator */}
          <line
            x1={state.lastCollision.point.x}
            y1={state.lastCollision.point.y}
            x2={state.lastCollision.point.x + state.lastCollision.normal.x * 20}
            y2={state.lastCollision.point.y + state.lastCollision.normal.y * 20}
            stroke="orange"
            strokeWidth="2"
            opacity={impactProgress}
          />

          {/* Impact point */}
          <circle
            cx={state.lastCollision.point.x}
            cy={state.lastCollision.point.y}
            r={4 * (1 + impactProgress)}
            fill="red"
            opacity={impactProgress}
          />

          <text
            x={state.lastCollision.point.x}
            y={state.lastCollision.point.y + 15}
            fontSize="16"
            fill="#FFFFFF"
            fontFamily="monospace"
            fontWeight="bold"
            style={{
              textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
            }}
          >
            {`${state.lastCollision.normal.x.toFixed(
              2,
            )} , ${state.lastCollision.normal.y.toFixed(2)}`}
          </text>
        </>
      )}
    </svg>
  )
}
