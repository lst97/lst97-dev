'use client'

import React, { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTypoSyncStore } from '../../store'
import type { Keystroke } from '../../types'
import { GAME_CONFIG, CANVAS_HEIGHT, screenToGameSpace } from '../../config'

interface BackgroundEffectProps {
  keystrokeMap: Keystroke[]
  gameTime: number
  gameState: any
}

export function BackgroundEffect({ keystrokeMap, gameTime, gameState }: BackgroundEffectProps) {
  const bgRef = useRef<THREE.Mesh>(null)
  const [lastHitTime, setLastHitTime] = useState(0)
  const [lastHitType, setLastHitType] = useState<'sync' | 'late' | 'early' | null>(null)

  useFrame(() => {
    if (!bgRef.current) return

    const { gameState } = useTypoSyncStore.getState()

    if (gameState.isPaused) return

    let syncEffect = 0
    let lateEarlyEffect = 0

    const recentSyncHits = keystrokeMap.filter(
      (k) => k.state === 'hit' && Math.abs(gameTime - k.startTime) <= 0.05,
    )

    const recentLateEarlyHits = keystrokeMap.filter(
      (k) =>
        k.state === 'hit' &&
        Math.abs(gameTime - k.startTime) > 0.05 &&
        Math.abs(gameTime - k.startTime) <= 0.15,
    )

    if (recentSyncHits.length > 0) {
      const timeSinceHit = Math.min(...recentSyncHits.map((k) => Math.abs(gameTime - k.startTime)))
      const effectDuration = 3.0
      const effectProgress = timeSinceHit / effectDuration

      if (effectProgress < 1.0) {
        const easedProgress = 1.0 - Math.pow(effectProgress, 3)
        syncEffect = easedProgress * 0.4
        setLastHitTime(gameTime)
        setLastHitType('sync')
      }
    } else if (recentLateEarlyHits.length > 0) {
      const timeSinceHit = Math.min(
        ...recentLateEarlyHits.map((k) => Math.abs(gameTime - k.startTime)),
      )
      const effectDuration = 1.5
      const effectProgress = timeSinceHit / effectDuration

      if (effectProgress < 1.0) {
        const easedProgress = 1.0 - Math.pow(effectProgress, 3)
        lateEarlyEffect = easedProgress * 0.15
        setLastHitTime(gameTime)
        setLastHitType('late')
      }
    }

    const waveProgress = lastHitTime > 0 ? (gameTime - lastHitTime) * 0.8 : 0

    const material = bgRef.current.material as THREE.ShaderMaterial
    material.uniforms.syncEffect.value = syncEffect
    material.uniforms.lateEarlyEffect.value = lateEarlyEffect
    material.uniforms.waveProgress.value = waveProgress
    material.uniforms.time.value = Date.now() * 0.0005
  })

  const backgroundMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        syncEffect: { value: 0.0 },
        lateEarlyEffect: { value: 0.0 },
        waveProgress: { value: 0.0 },
        time: { value: 0.0 },
        hitZoneX: { value: screenToGameSpace(GAME_CONFIG.HIT_ZONE_X, CANVAS_HEIGHT / 2).x },
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
          vec3 baseColor = mix(
            vec3(0.88, 0.88, 0.88),
            vec3(0.96, 0.96, 0.96),
            smoothstep(0.0, 1.0, vUv.y)
          );
          
          if (syncEffect > 0.0) {
            float waveX = waveProgress * 1.2;
            float distanceFromWave = abs(vUv.x - waveX);
            
            float waveIntensity = syncEffect * exp(-distanceFromWave * 2.0);
            waveIntensity = smoothstep(0.0, 1.0, waveIntensity);
            
            vec3 syncGradient = vec3(0.0, waveIntensity * 0.7, waveIntensity * 0.25);
            baseColor = mix(baseColor, baseColor + syncGradient, waveIntensity);
          }
          
          if (lateEarlyEffect > 0.0) {
            float hitZoneUV = 0.1;
            float distanceFromHitZone = abs(vUv.x - hitZoneUV);
            
            float lateEarlyIntensity = lateEarlyEffect * exp(-distanceFromHitZone * 4.0);
            lateEarlyIntensity = smoothstep(0.0, 1.0, lateEarlyIntensity);
            
            vec3 lateEarlyGradient = vec3(lateEarlyIntensity * 0.4, lateEarlyIntensity * 0.3, 0.0);
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
