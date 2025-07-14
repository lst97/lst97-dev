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
  const geometriesToDispose = useRef<THREE.BufferGeometry[]>([])
  const materialsToDispose = useRef<THREE.Material[]>([])

  // Callback refs to collect geometries and materials for disposal
  const collectGeometry = React.useCallback((geometry: THREE.BufferGeometry) => {
    if (geometry && !geometriesToDispose.current.includes(geometry)) {
      geometriesToDispose.current.push(geometry)
    }
  }, [])

  const collectMaterial = React.useCallback((material: THREE.Material) => {
    if (material && !materialsToDispose.current.includes(material)) {
      materialsToDispose.current.push(material)
    }
  }, [])

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
    const fadeTime = 2.0 // Reduced from 4.0 to 2.0 seconds
    const fadeStart = 1.0 // Reduced from 2.0 to 1.0 seconds

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

  // Cleanup function to dispose Three.js resources
  React.useEffect(() => {
    return () => {
      // Dispose all collected geometries
      geometriesToDispose.current.forEach(geometry => {
        geometry.dispose()
      })
      geometriesToDispose.current = []
      
      // Dispose all collected materials
      materialsToDispose.current.forEach(material => {
        material.dispose()
      })
      materialsToDispose.current = []
    }
  }, [])

  return (
    <group ref={particleRef} position={position as any}>
      <mesh>
        <boxGeometry 
          ref={collectGeometry} 
          args={[size * 1.1, size * 1.1, size * 1.1]} 
        />
        <meshBasicMaterial 
          ref={collectMaterial}
          color={borderColor} 
          transparent 
          opacity={1.0} 
        />
      </mesh>
      <mesh>
        <boxGeometry 
          ref={collectGeometry}
          args={[size, size, size]} 
        />
        <meshBasicMaterial 
          ref={collectMaterial}
          color={color} 
          transparent 
          opacity={1.0} 
        />
      </mesh>
    </group>
  )
}
