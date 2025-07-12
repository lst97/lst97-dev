'use client'

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface GlassParticleProps {
  position: [number, number, number]
  velocity: [number, number, number]
  startTime: number
  size: number
  rotationSpeed: [number, number, number]
  color: string
  isFireParticle?: boolean
}

export function PixelParticle({
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
    const delta = (now - prevTimeRef.current) / 1000
    prevTimeRef.current = now

    const gravity = isFireParticle ? -2.0 : -9.81
    const groundY = -3.0
    const leftWallX = -7.95
    const bounceDamping = 0.4
    const friction = isFireParticle ? 0.98 : 0.995

    const v = velocityRef.current
    v[1] += gravity * delta
    v[0] *= friction
    v[2] *= friction

    if (isFireParticle) {
      v[0] *= 0.95
      v[2] *= 0.95
    }

    let x = particleRef.current.position.x + v[0] * delta
    let y = particleRef.current.position.y + v[1] * delta
    const z = particleRef.current.position.z + v[2] * delta

    if (y <= groundY) {
      y = groundY
      if (Math.abs(v[1]) > 0.3) {
        v[1] = -v[1] * bounceDamping
      } else {
        v[1] = 0
        v[0] *= 0.9
        v[2] *= 0.9
      }
    }

    if (x <= leftWallX) {
      x = leftWallX
      if (Math.abs(v[0]) > 0.2) {
        v[0] = -v[0] * bounceDamping
      } else {
        v[0] = 0
      }
    }

    particleRef.current.position.set(x, y, z)

    particleRef.current.rotation.x += rotationSpeed[0] * delta * 0.8
    particleRef.current.rotation.y += rotationSpeed[1] * delta * 0.8
    particleRef.current.rotation.z += rotationSpeed[2] * delta * 0.8

    const elapsed = (now - startTime) / 1000
    const fadeTime = 4.0
    const fadeStart = 2.0

    let opacity = 1.0
    if (elapsed > fadeStart) {
      const fadeProgress = (elapsed - fadeStart) / (fadeTime - fadeStart)
      opacity = Math.max(0, 1.0 - Math.pow(fadeProgress, 1.5))
    }

    particleRef.current.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshBasicMaterial
        material.opacity = opacity
      }
    })

    particleRef.current.visible = opacity > 0.01
  })

  const borderColor = useMemo(() => {
    const baseColor = new THREE.Color(color)
    return baseColor.clone().multiplyScalar(0.6)
  }, [color])

  return (
    <group ref={particleRef} position={position as any}>
      <mesh>
        <boxGeometry args={[size * 1.1, size * 1.1, size * 1.1]} />
        <meshBasicMaterial color={borderColor} transparent opacity={1.0} />
      </mesh>
      <mesh>
        <boxGeometry args={[size, size, size]} />
        <meshBasicMaterial color={color} transparent opacity={1.0} />
      </mesh>
    </group>
  )
}
