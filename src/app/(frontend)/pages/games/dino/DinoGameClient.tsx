'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LoadingSpinner } from '@/frontend/components/common/loading/Loading'
import dynamic from 'next/dynamic'

// Dynamically import the Dashboard component with SSR disabled
const DynamicDashboard = dynamic(
  () => import('@/frontend/components/main/Dashboard').then((mod) => mod.Dashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-screen">
        <LoadingSpinner />
        <div className="mt-4 font-['Press_Start_2P'] text-sm">Loading dashboard...</div>
      </div>
    ),
  },
)

const DinoGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [isGameRunning, setIsGameRunning] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const dino = {
      x: 50,
      y: 200,
      width: 50,
      height: 50,
      velocityY: 0,
      isJumping: false,
    }

    const obstacles: { x: number; y: number; width: number; height: number }[] = []
    let frameCount = 0
    let obstacleSpeed = 5

    const dinoImg = new window.Image()
    dinoImg.src = '/dino_game/dinosaur.png'

    const obstacleImg = new window.Image()
    obstacleImg.src = '/dino_game/obstacle.png'

    const groundImg = new window.Image()
    groundImg.src = '/dino_game/ground.png'

    const jump = () => {
      if (!dino.isJumping) {
        dino.velocityY = -12
        dino.isJumping = true
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        jump()
      }
    }

    const handleClick = () => {
      jump()
    }

    document.addEventListener('keydown', handleKeyDown)
    canvas.addEventListener('click', handleClick)

    const gameLoop = () => {
      if (!isGameRunning) return

      context.clearRect(0, 0, canvas.width, canvas.height)

      // Draw ground
      context.drawImage(groundImg, 0, canvas.height - 20, canvas.width, 20)

      // Dino
      dino.velocityY += 0.5 // Gravity
      dino.y += dino.velocityY

      if (dino.y > 200) {
        dino.y = 200
        dino.isJumping = false
      }

      context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height)

      // Obstacles
      if (frameCount % 120 === 0) {
        const obstacleHeight = 30 + Math.random() * 40
        obstacles.push({
          x: canvas.width,
          y: 250 - obstacleHeight,
          width: 30,
          height: obstacleHeight,
        })
      }

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i]
        o.x -= obstacleSpeed
        context.drawImage(obstacleImg, o.x, o.y, o.width, o.height)

        if (o.x + o.width < 0) {
          obstacles.splice(i, 1)
          setScore((prevScore) => prevScore + 1)
        }

        // Collision detection
        if (
          dino.x < o.x + o.width &&
          dino.x + dino.width > o.x &&
          dino.y < o.y + o.height &&
          dino.y + dino.height > o.y
        ) {
          setIsGameRunning(false)
          if (score > highScore) {
            setHighScore(score)
          }
        }
      }

      frameCount++
      requestAnimationFrame(gameLoop)
    }

    if (isGameRunning) {
      gameLoop()
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      canvas.removeEventListener('click', handleClick)
    }
  }, [isGameRunning, score, highScore])

  const startGame = () => {
    setScore(0)
    setIsGameRunning(true)
  }

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={800} height={300} className="border-2 border-black bg-white" />
      <div className="font-['Press_Start_2P'] text-lg mt-4">
        <p>Score: {score}</p>
        <p>High Score: {highScore}</p>
      </div>
      {!isGameRunning && (
        <button
          onClick={startGame}
          className="mt-4 px-4 py-2 bg-blue-500 text-white font-['Press_Start_2P'] text-lg rounded"
        >
          Start Game
        </button>
      )}
    </div>
  )
}

const DinoGameContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="relative w-full min-h-screen flex flex-col bg-transparent">
        <main className="relative flex-grow w-full max-w-[1800px] mx-auto px-2 md:px-8 py-4 sm:py-6 md:py-8 mt-[100px] sm:mt-[120px] md:mt-[140px] lg:mt-[180px] bg-transparent">
          <section className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-['Press_Start_2P'] text-text-color mb-6">
              Dino Game
            </h1>
            <p className="text-lg md:text-xl text-text-color max-w-3xl font-['Press_Start_2P'] mx-auto">
              A simple recreation of the classic Chrome Dino game. Press space or click to jump.
            </p>
          </section>
          <section className="flex justify-center">
            <DinoGame />
          </section>
        </main>
      </div>
    </motion.div>
  )
}

export default function DinoGameClient() {
  return (
    <DynamicDashboard>
      <DinoGameContent />
    </DynamicDashboard>
  )
}
