'use client'

import React, { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTypoSyncStore } from '../../../store'
import type { Keystroke } from '../../../types'
import { GAME_CONFIG, CANVAS_HEIGHT, screenToGameSpace } from '../../../config'

interface WaveHitEffectProps {
  keystrokeMap: Keystroke[]
  gameTime: number
}

interface WaveData {
  startTime: number
  type: 'sync' | 'late'
  id: string
}

export function WaveHitEffect({ keystrokeMap, gameTime }: WaveHitEffectProps) {
  const bgRef = useRef<THREE.Mesh>(null)
  const [activeWaves, setActiveWaves] = useState<WaveData[]>([])
  const processedHits = useRef<Set<string>>(new Set())

  useFrame(() => {
    if (!bgRef.current) return

    const { gameState } = useTypoSyncStore.getState()

    if (gameState.isPaused) return

    // Find new hits and add them as waves
    const allHits = keystrokeMap.filter((k) => k.state === 'hit')

    setActiveWaves((prevWaves) => {
      let newWaves = [...prevWaves]

      // Process each hit individually based on its actual timing accuracy
      allHits.forEach((hit) => {
        const hitId = `${hit.startTime}-${hit.key}-${hit.timingAccuracy || 'unknown'}`

        // Skip if already processed
        if (processedHits.current.has(hitId)) return

        // Determine wave type based on the timing accuracy property
        let waveType: 'sync' | 'late'
        if (hit.timingAccuracy === 'sync') {
          waveType = 'sync'
        } else if (hit.timingAccuracy === 'early' || hit.timingAccuracy === 'late') {
          waveType = 'late'
        } else {
          // Fallback: calculate timing error manually if timingAccuracy is not set
          const timingError = Math.abs(gameTime - hit.startTime)
          waveType = timingError <= 0.05 ? 'sync' : 'late'
        }

        // Add the wave
        processedHits.current.add(hitId)
        newWaves.push({
          startTime: hit.startTime, // Use the keystroke start time
          type: waveType,
          id: hitId,
        })
      })

      // Remove expired waves - use longer duration to match shader
      const maxWaveDuration = 2.5 // Max wave duration (longer than shader max of 2.0s)
      newWaves = newWaves.filter((wave) => {
        const waveAge = gameTime - wave.startTime
        return waveAge < maxWaveDuration
      })

      return newWaves
    })

    // Update shader uniforms with all active waves
    const material = bgRef.current.material as THREE.ShaderMaterial

    // Pack wave data into arrays (max 8 waves for performance)
    const maxWaves = 8
    const waveStartTimes = new Array(maxWaves).fill(0)
    const waveTypes = new Array(maxWaves).fill(0) // 0=none, 1=sync, 2=late
    const waveCount = Math.min(activeWaves.length, maxWaves)

    for (let i = 0; i < waveCount; i++) {
      waveStartTimes[i] = activeWaves[i].startTime
      waveTypes[i] = activeWaves[i].type === 'sync' ? 1 : 2
    }

    material.uniforms.waveStartTimes.value = waveStartTimes
    material.uniforms.waveTypes.value = waveTypes
    material.uniforms.waveCount.value = waveCount
    material.uniforms.gameTime.value = gameTime
    material.uniforms.time.value = Date.now() * 0.0005
  })

  const backgroundMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        waveStartTimes: { value: new Array(8).fill(0) },
        waveTypes: { value: new Array(8).fill(0) },
        waveCount: { value: 0 },
        gameTime: { value: 0.0 },
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
        uniform float waveStartTimes[8];
        uniform int waveTypes[8];
        uniform int waveCount;
        uniform float gameTime;
        uniform float time;
        uniform float hitZoneX;
        varying vec2 vUv;
        
        // Single wave function - wider, slower, with limited travel distance
        float createSingleWave(vec2 pos, float waveStartTime, int waveType) {
          float waveAge = gameTime - waveStartTime;
          
          // Slower wave speed and limited travel distance
          float waveSpeed = waveType == 1 ? 1.0 : 0.8; // much slower animation
          float maxTravelDistance = waveType == 1 ? 0.5 : 0.33; // sync: half container, late: 1/3 container
          float waveProgress = min(waveAge * waveSpeed, maxTravelDistance);
          
          // Time-based opacity fade - longer duration for slower waves
          float maxDuration = waveType == 1 ? 2.0 : 1.5; // longer visible duration
          float timeOpacity = 1.0 - smoothstep(0.0, maxDuration, waveAge);
          if (timeOpacity <= 0.0) return 0.0;
          
          // Base opacity based on wave type
          float baseOpacity = waveType == 1 ? 1.0 : 0.6; // late hits less visible
          
          // Wave front position
          float waveFront = waveProgress;
          
          // Only show wave behind the front
          if (pos.x > waveFront) return 0.0;
          
          // Distance behind wave front
          float distBehind = waveFront - pos.x;
          
          // Wider wave range - much larger wave size
          float waveRange = waveType == 1 ? 0.6 : 0.4; // much wider waves
          if (distBehind > waveRange) return 0.0;
          
          // Soft wave head - gradual fade at the front
          float distFromFront = distBehind / waveRange;
          float headSoftness = waveType == 1 ? 0.2 : 0.15; // softer head for wider waves
          float headFalloff = 1.0;
          
          if (distFromFront < headSoftness) {
            // Soft transition at wave head
            headFalloff = smoothstep(0.0, headSoftness, distFromFront);
          }
          
          // Wave tail falloff - gentler decay for wider waves
          float tailFalloff = exp(-distBehind * (waveType == 1 ? 3.0 : 4.0));
          
          // Combine head and tail falloff
          float spatialFalloff = headFalloff * tailFalloff;
          
          // Create natural wave ripples - slower animation
          float ripple1 = sin(pos.y * 6.0 + time * 3.0 + distBehind * 8.0);
          float ripple2 = sin(pos.y * 9.0 + time * 4.0 + distBehind * 12.0) * 0.6;
          float ripple3 = sin(pos.y * 12.0 + time * 5.0 + distBehind * 16.0) * 0.3;
          
          float totalRipple = (ripple1 + ripple2 + ripple3) * 0.3;
          
          // Base gradient intensity
          float baseIntensity = spatialFalloff * timeOpacity * baseOpacity * 0.5;
          
          // Wave ripple intensity
          float rippleIntensity = abs(totalRipple) * spatialFalloff * timeOpacity * baseOpacity * 0.3;
          
          return baseIntensity + rippleIntensity;
        }
        
        void main() {
          // Darker base color to match wave background better
          vec3 baseColor = mix(
            vec3(0.82, 0.85, 0.82),
            vec3(0.90, 0.93, 0.90),
            smoothstep(0.0, 1.0, vUv.y)
          );
          
          vec3 finalColor = baseColor;
          
          // Process all active waves
          for (int i = 0; i < 8; i++) {
            if (i >= waveCount) break;
            
            float waveIntensity = createSingleWave(vUv, waveStartTimes[i], waveTypes[i]);
            
            if (waveIntensity > 0.0) {
              vec3 waveColor;
              
              if (waveTypes[i] == 1) {
                // Sync wave - bright green
                waveColor = vec3(0.0, 0.8, 0.2);
              } else {
                // Late wave - lighter green
                waveColor = vec3(0.2, 0.6, 0.3);
              }
              
              // Blend wave color with existing color
              finalColor = mix(finalColor, finalColor + waveColor * waveIntensity, waveIntensity);
            }
          }
          
          gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
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
