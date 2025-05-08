'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'

enum GameStatus {
  STOP = 'STOP',
  START = 'START',
  PAUSE = 'PAUSE',
  OVER = 'OVER',
}

const JUMP_DELTA = 5
const JUMP_MAX_HEIGHT = 53

interface GameOptions {
  fps?: number
  skySpeed?: number
  groundSpeed?: number
  skyImage?: HTMLImageElement
  groundImage?: HTMLImageElement
  playerImage?: HTMLImageElement[]
  obstacleImage?: HTMLImageElement
  skyOffset?: number
  groundOffset?: number
}

interface Obstacle {
  distance: number
}

const ChromeDinoGame: React.FC<{ options?: GameOptions }> = ({ options: propOptions }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<GameStatus>(GameStatus.STOP)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [playerStatus, setPlayerStatus] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(false)

  // Refs for values that change frequently
  const jumpHeight = useRef(0)
  const jumpDelta = useRef(0)
  const currentDistance = useRef(0)
  const obstaclesBase = useRef(1)
  const obstacles = useRef<Obstacle[]>([])
  const animationFrameId = useRef<number>(null)
  const gameOptions = useRef<GameOptions>({})
  const imagesLoadedCount = useRef(0)

  // Game logic
  const generateObstacles = useCallback((): Obstacle[] => {
    const newObstacles: Obstacle[] = []
    for (let i = 0; i < 10; i++) {
      const random = Math.floor(Math.random() * 100) % 60
      const sign = Math.random() < 0.5 ? 1 : -1 // Fixed random sign calculation
      newObstacles.push({
        distance: sign * random + obstaclesBase.current * 200,
      })
    }
    obstaclesBase.current++
    return newObstacles
  }, [])

  const clearGame = useCallback(() => {
    setScore(0)
    jumpHeight.current = 0
    currentDistance.current = 0
    obstacles.current = []
    obstaclesBase.current = 1
    setPlayerStatus(0)
  }, [])

  // Jump mechanics
  const jump = useCallback(() => {
    if (jumpHeight.current > 2) return
    jumpDelta.current = JUMP_DELTA
    jumpHeight.current = JUMP_DELTA
  }, [])

  // Game controls
  const start = useCallback(() => {
    if (status === GameStatus.START) return
    setStatus(GameStatus.START)
    obstacles.current = generateObstacles()
    jump()
  }, [status, generateObstacles, jump])

  // const pause = useCallback(() => {
  // 	if (status === GameStatus.START) {
  // 		setStatus(GameStatus.PAUSE);
  // 	}
  // }, [status]);

  // const goOn = useCallback(() => {
  // 	if (status === GameStatus.PAUSE) {
  // 		setStatus(GameStatus.START);
  // 	}
  // }, [status]);

  const stop = useCallback(() => {
    if (status === GameStatus.OVER) return
    setStatus(GameStatus.OVER)
    setPlayerStatus(3)
    clearGame()
  }, [status, clearGame])

  // Drawing logic
  const draw = useCallback(() => {
    if (!canvasRef.current || !imagesLoaded) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { fps, skySpeed, groundSpeed, skyImage, groundImage, playerImage, obstacleImage } =
      gameOptions.current
    if (!skyImage || !groundImage || !playerImage || !obstacleImage) return

    const level = Math.min(200, Math.floor(score / 100))
    const adjustedGroundSpeed = (groundSpeed! + level) / fps!
    const adjustedSkySpeed = skySpeed! / fps!

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()

    // Draw sky
    gameOptions.current.skyOffset =
      gameOptions.current.skyOffset! < canvas.width
        ? gameOptions.current.skyOffset! + adjustedSkySpeed
        : gameOptions.current.skyOffset! - canvas.width
    ctx.translate(-gameOptions.current.skyOffset!, 0)
    ctx.drawImage(skyImage, 0, 0)
    ctx.drawImage(skyImage, skyImage.width, 0)

    // Draw ground
    gameOptions.current.groundOffset =
      gameOptions.current.groundOffset! < canvas.width
        ? gameOptions.current.groundOffset! + adjustedGroundSpeed
        : gameOptions.current.groundOffset! - canvas.width
    ctx.translate(gameOptions.current.skyOffset! - gameOptions.current.groundOffset!, 0)
    ctx.drawImage(groundImage, 0, 76)
    ctx.drawImage(groundImage, groundImage.width, 76)

    // Draw player
    ctx.translate(gameOptions.current.groundOffset!, 0)
    ctx.drawImage(playerImage[playerStatus], 80, 64 - jumpHeight.current)

    // Update jump physics
    jumpHeight.current += jumpDelta.current
    if (jumpHeight.current <= 1) {
      jumpHeight.current = 0
      jumpDelta.current = 0
    } else if (jumpHeight.current < JUMP_MAX_HEIGHT && jumpDelta.current > 0) {
      jumpDelta.current = jumpHeight.current ** 2 * 0.001033 - jumpHeight.current * 0.137 + 5
    } else if (jumpHeight.current >= JUMP_MAX_HEIGHT) {
      jumpDelta.current = -JUMP_DELTA / 2.7
    }

    // Update score
    if (status === GameStatus.START) {
      setScore((prev) => {
        const newScore = prev + 0.5
        if (newScore > highScore) {
          setHighScore(newScore)
          localStorage.setItem('highScore', newScore.toString())
        }
        return newScore
      })
      currentDistance.current += adjustedGroundSpeed
      if (score % 4 === 0) {
        setPlayerStatus((prev) => (prev + 1) % 3)
      }
    }

    // Collision detection
    const obstacleWidth = obstacleImage.width
    const playerWidth = playerImage[0].width
    const playerHeight = playerImage[0].height
    const firstObstacleOffset =
      canvas.width -
      (currentDistance.current - obstacles.current[0]?.distance + adjustedGroundSpeed)

    if (
      firstObstacleOffset &&
      90 - obstacleWidth < firstObstacleOffset &&
      firstObstacleOffset < 60 + playerWidth &&
      64 - jumpHeight.current + playerHeight > 84
    ) {
      stop()
    }

    ctx.restore()
    animationFrameId.current = requestAnimationFrame(draw)
  }, [status, score, highScore, playerStatus, imagesLoaded, stop])

  // Load images
  useEffect(() => {
    const loadImages = () => {
      const skyImage = new Image()
      const groundImage = new Image()
      const playerImage = new Image()
      const playerLeftImage = new Image()
      const playerRightImage = new Image()
      const playerDieImage = new Image()
      const obstacleImage = new Image()

      const handleImageLoad = () => {
        imagesLoadedCount.current += 1
        if (imagesLoadedCount.current === 3) {
          setImagesLoaded(true)
          draw()
        }
      }

      skyImage.onload = handleImageLoad
      groundImage.onload = handleImageLoad
      playerImage.onload = handleImageLoad

      skyImage.src = '/dino_game/cloud.png'
      groundImage.src = '/dino_game/ground.png'
      playerImage.src = '/dino_game/dinosaur.png'
      playerLeftImage.src = '/dino_game/dinosaur-left.png'
      playerRightImage.src = '/dino_game/dinosaur-right.png'
      playerDieImage.src = '/dino_game/dinosaur-die.png'
      obstacleImage.src = '/dino_game/obstacle.png'

      gameOptions.current = {
        fps: 60,
        skySpeed: 40,
        groundSpeed: 100,
        skyImage,
        groundImage,
        playerImage: [playerImage, playerLeftImage, playerRightImage, playerDieImage],
        obstacleImage,
        skyOffset: 0,
        groundOffset: 0,
        ...propOptions,
      }
    }

    loadImages()
  }, [propOptions, draw])

  const restart = useCallback(() => {
    obstacles.current = generateObstacles()
    start()
  }, [start, generateObstacles])

  // Game loop control
  useEffect(() => {
    if (status === GameStatus.START) {
      animationFrameId.current = requestAnimationFrame(draw)
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [status, draw])

  // Event listeners
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        handleSpacePress()
      }
    }

    const handleSpacePress = () => {
      switch (status) {
        case GameStatus.STOP:
          // start(); // Remove call to start()
          break
        case GameStatus.START:
          jump()
          break
        case GameStatus.OVER:
          restart()
          break
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    const canvas = canvasRef.current
    if (canvas) canvas.parentNode?.addEventListener('click', handleSpacePress)

    return () => {
      window.removeEventListener('keypress', handleKeyPress)
      if (canvas) canvas.parentNode?.removeEventListener('click', handleSpacePress)
    }
  }, [status, start, jump, restart])

  // High score initialization
  useEffect(() => {
    const savedHighScore = localStorage.getItem('highScore')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10))
    }
  }, [])

  // Auto start game when images are loaded
  useEffect(() => {
    if (imagesLoaded) {
      start()
    }
  }, [imagesLoaded, start])

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <canvas
        ref={canvasRef}
        height={360}
        width={window.innerWidth}
        style={{ position: 'absolute', bottom: -200 }}
      />
    </div>
  )
}

export default ChromeDinoGame
