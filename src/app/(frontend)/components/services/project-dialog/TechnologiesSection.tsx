/**
 * TechnologiesSection
 * Renders a physics-based interactive display of technology icons using Matter.js.
 * Allows users to drag and interact with technology boxes.
 * @param technologies - Array of technology objects to display
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Matter from 'matter-js'
import * as RiIcons from 'react-icons/ri'
import { ProjectTechnology } from '../types'

interface TechnologiesSectionProps {
  technologies: ProjectTechnology[]
}

// Magic numbers as named constants
const MAX_CANVAS_WIDTH = 1000
const MIN_CANVAS_WIDTH = 320
const CANVAS_HEIGHT = 500
const BOX_SIZE = 120
const GRAVITY_Y = 1.5
const ANGULAR_DAMPING = 0.05
const LINEAR_DAMPING = 0.01
const RESTITUTION = 0.8
const DENSITY = 0.002
const SLEEP_THRESHOLD = 60
const WALL_RESTITUTION = 0.1
const WALL_FRICTION = 0.8
const WALL_THICKNESS = 50
const WALL_BUFFER = 25
const CHAMFER_RADIUS = 16
const INITIAL_VELOCITY_RANGE = 10
const RELEASED_DOWNWARD_VELOCITY = 0.5

export const TechnologiesSection: React.FC<TechnologiesSectionProps> = ({ technologies }) => {
  const sceneRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const [technologyBodies, setTechnologyBodies] = useState<Matter.Body[]>([])
  const [renderReady, setRenderReady] = useState(false)
  const renderRef = useRef<Matter.Render | null>(null)
  const runnerRef = useRef<Matter.Runner | null>(null)
  const [canvasWidth, setCanvasWidth] = useState(MAX_CANVAS_WIDTH)
  const canvasHeight = 500
  const boxSize = 120
  const visualElementsRef = useRef<(HTMLDivElement | null)[]>([])
  const animationFrameRef = useRef<number | null>(null)
  const isUpdatingRef = useRef(false)
  const beforeUpdateListenerRef = useRef<() => void>(() => {})
  const wallsRef = useRef<{
    ground: Matter.Body | null
    leftWall: Matter.Body | null
    rightWall: Matter.Body | null
    topWall: Matter.Body | null
  }>({
    ground: null,
    leftWall: null,
    rightWall: null,
    topWall: null,
  })

  // Store the update function in a ref to avoid dependency issues
  const updateFnRef = useRef<() => void>(() => {})

  // Responsive: observe container width
  useEffect(() => {
    if (!sceneRef.current) return
    const container = sceneRef.current.parentElement
    if (!container) return

    const updateWidth = () => {
      const width = Math.max(MIN_CANVAS_WIDTH, Math.min(container.offsetWidth, MAX_CANVAS_WIDTH))

      // Only update if width actually changed
      if (width !== canvasWidth) {
        setCanvasWidth(width)
      }
    }

    updateWidth()
    const resizeObserver = new window.ResizeObserver(updateWidth)
    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [canvasWidth])

  // Update wall positions when canvas width changes
  useEffect(() => {
    if (!engineRef.current || !wallsRef.current.rightWall) return

    // Update right wall position to match new canvas width
    Matter.Body.setPosition(wallsRef.current.rightWall, {
      x: canvasWidth + WALL_BUFFER,
      y: CANVAS_HEIGHT / 2,
    })

    // Update ground and top wall to match new canvas width
    if (wallsRef.current.ground) {
      Matter.Body.setPosition(wallsRef.current.ground, {
        x: canvasWidth / 2,
        y: CANVAS_HEIGHT + WALL_BUFFER,
      })
    }

    if (wallsRef.current.topWall) {
      Matter.Body.setPosition(wallsRef.current.topWall, {
        x: canvasWidth / 2,
        y: -WALL_BUFFER,
      })
    }

    // Check if any technology bodies are now outside the container and move them inside
    technologyBodies.forEach((body) => {
      const x = body.position.x
      const y = body.position.y

      // If body is outside right wall, move it inside
      if (x > canvasWidth - BOX_SIZE / 2) {
        Matter.Body.setPosition(body, {
          x: canvasWidth - BOX_SIZE / 2 - 5,
          y: y,
        })
      }
    })

    // Ensure render is updated with new canvas size
    if (renderRef.current && renderRef.current.options) {
      renderRef.current.options.width = canvasWidth
      renderRef.current.canvas.width = canvasWidth
    }
  }, [canvasWidth, technologyBodies])

  // Update visual elements position to match physics bodies - without altering physics!
  useEffect(() => {
    // Define update function only when dependencies change
    const updateVisualElements = () => {
      if (!renderReady || !technologyBodies.length) return

      // Prevent concurrent updates
      if (isUpdatingRef.current) return
      isUpdatingRef.current = true

      technologyBodies.forEach((body, index) => {
        const visualElement = visualElementsRef.current[index]
        if (visualElement && body) {
          // IMPORTANT: Only read positions from physics, don't modify them here!
          // Update visual position based directly on physics body
          visualElement.style.left = `${body.position.x - boxSize / 2}px`
          visualElement.style.top = `${body.position.y - boxSize / 2}px`
          visualElement.style.transform = `rotate(${body.angle}rad)`
        }
      })

      isUpdatingRef.current = false

      // Continue animation loop if we're still mounted
      if (renderReady) {
        animationFrameRef.current = requestAnimationFrame(updateVisualElements)
      }
    }

    // Store the update function
    updateFnRef.current = updateVisualElements

    // Start animation loop
    if (renderReady && technologyBodies.length) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      animationFrameRef.current = requestAnimationFrame(updateVisualElements)
    }

    // Clean up animation frame on unmount or when dependencies change
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [renderReady, technologyBodies]) // Removed constrainPosition dependency

  // Initial physics setup - only runs once
  useEffect(() => {
    // Import all needed Matter.js modules
    const { Engine, Render, World, Bodies, Runner, Events } = Matter

    if (!sceneRef.current) return

    // Clear any previous content
    sceneRef.current.innerHTML = ''

    // Create engine with proper gravity and enable sleeping
    const engine = Engine.create({
      gravity: { x: 0, y: GRAVITY_Y }, // Slightly reduced gravity
      enableSleeping: true, // Critical for stability
    })
    engineRef.current = engine

    // Custom angular damping implementation
    const beforeUpdateListener = () => {
      // Get all non-static bodies from the world
      const allBodies = Matter.Composite.allBodies(engine.world)
      allBodies.forEach((body) => {
        if (!body.isStatic && !body.isSleeping) {
          // Apply angular damping - reduce angular velocity over time
          const angularDampingFactor = ANGULAR_DAMPING // Adjust as needed (0.01 to 0.1)
          const linearDampingFactor = LINEAR_DAMPING // Optional: dampen linear velocity

          // Apply angular damping
          Matter.Body.setAngularVelocity(body, body.angularVelocity * (1 - angularDampingFactor))

          // Apply linear damping to help settle faster
          Matter.Body.setVelocity(body, {
            x: body.velocity.x * (1 - linearDampingFactor),
            y: body.velocity.y * (1 - linearDampingFactor),
          })
        }
      })
    }

    // Register the event listener
    Events.on(engine, 'beforeUpdate', beforeUpdateListener)
    // Store reference for cleanup
    beforeUpdateListenerRef.current = beforeUpdateListener

    // Add collision wake-up listener - wake up sleeping bodies on collision
    const collisionStartListener = (event: Matter.IEventCollision<Matter.Engine>) => {
      // When a collision occurs, wake up the involved bodies
      const pairs = event.pairs
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i]
        // Wake up both bodies
        Matter.Sleeping.set(pair.bodyA, false)
        Matter.Sleeping.set(pair.bodyB, false)
      }
    }
    Events.on(engine, 'collisionStart', collisionStartListener)

    // Create runner at a higher frequency for smoother simulation
    const runner = Runner.create({
      isFixed: true,
      delta: 1000 / 60, // 60 FPS
    })
    runnerRef.current = runner

    // Create renderer
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: canvasWidth,
        height: canvasHeight,
        wireframes: false,
        background: 'transparent',
        showSleeping: false,
      },
    })
    renderRef.current = render

    // Create ground and walls (invisible but with proper collision)
    const wallOptions = {
      isStatic: true,
      render: {
        visible: false,
      },
      restitution: WALL_RESTITUTION, // Lower restitution for less bounce
      friction: WALL_FRICTION, // High friction to prevent sliding
    }

    // Place walls to create boundaries
    const ground = Bodies.rectangle(
      canvasWidth / 2,
      canvasHeight + 25,
      canvasWidth + 50,
      50,
      wallOptions,
    )
    const leftWall = Bodies.rectangle(-25, canvasHeight / 2, 50, canvasHeight + 50, wallOptions)
    const rightWall = Bodies.rectangle(
      canvasWidth + 25,
      canvasHeight / 2,
      50,
      canvasHeight + 50,
      wallOptions,
    )
    const topWall = Bodies.rectangle(canvasWidth / 2, -25, canvasWidth + 50, 50, wallOptions)

    // Store walls for later updates
    wallsRef.current = {
      ground,
      leftWall,
      rightWall,
      topWall,
    }

    // Create technology boxes, explicitly setting isStatic: false
    const techBodies = technologies.map((tech, i) =>
      Bodies.rectangle(
        // Random x between boxSize/2+10 and canvasWidth-boxSize/2-10
        Math.random() * (canvasWidth - boxSize - 20) + boxSize / 2 + 10,
        // Random y between boxSize/2+10 and canvasHeight/2 (upper half)
        Math.random() * (canvasHeight / 2 - boxSize - 20) + boxSize / 2 + 10,
        boxSize, // width of box
        boxSize, // height of box
        {
          restitution: RESTITUTION, // Bounciness
          density: DENSITY, // Slightly higher mass for stability
          isStatic: false, // Explicitly set as non-static
          label: tech.title,
          chamfer: { radius: CHAMFER_RADIUS }, // Slightly rounded corners
          render: {
            fillStyle: '#fef3c6',
            visible: true,
          },
          sleepThreshold: SLEEP_THRESHOLD, // Lower sleep threshold - wake up more easily
          collisionFilter: {
            group: 0, // Default group
            category: 0x0001, // Category 1
            mask: 0xffffffff, // Collide with all categories
          },
        },
      ),
    )

    // Reset visual elements ref
    visualElementsRef.current = Array(technologies.length).fill(null)

    // Give each body a random velocity (throw effect)
    techBodies.forEach((body) => {
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * INITIAL_VELOCITY_RANGE, // Random x velocity between -5 and 5
        y: (Math.random() - 0.5) * INITIAL_VELOCITY_RANGE, // Random y velocity between -5 and 5
      })
    })

    // Clear and add all elements to the world
    World.clear(engine.world, false)
    World.add(engine.world, [ground, leftWall, rightWall, topWall, ...techBodies])

    // Start the engine and renderer
    Render.run(render)
    Runner.run(runner, engine)

    // Store bodies reference for use in dragging
    setTechnologyBodies(techBodies)
    setRenderReady(true)

    // Clean up on unmount
    return () => {
      // Stop the animation
      setRenderReady(false)

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      // Remove event listeners
      if (engine) {
        Events.off(engine, 'beforeUpdate', beforeUpdateListenerRef.current)
        Events.off(engine, 'collisionStart', collisionStartListener)
      }

      // Stop the simulation
      if (runner) Runner.stop(runner)
      if (render) Render.stop(render)

      // Clear engine and remove canvas
      if (engine) Engine.clear(engine)
      if (render && render.canvas && render.canvas.parentNode) {
        render.canvas.parentNode.removeChild(render.canvas)
      }

      // Clear refs
      engineRef.current = null
      renderRef.current = null
      runnerRef.current = null
      wallsRef.current = {
        ground: null,
        leftWall: null,
        rightWall: null,
        topWall: null,
      }
    }
  }, [technologies]) // No dependency on canvasWidth here

  // Drag handler for technology boxes
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (draggedIndex === null || !technologyBodies[draggedIndex] || !engineRef.current) return

    // When drag starts, make the body static so it doesn't fall
    Matter.Body.setStatic(technologyBodies[draggedIndex], true)

    const handleMouseMove = (e: MouseEvent) => {
      if (!sceneRef.current || draggedIndex === null || !technologyBodies[draggedIndex]) return

      const rect = sceneRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Keep positions within boundary constraints
      const x = Math.max(boxSize / 2 + 5, Math.min(mouseX, canvasWidth - boxSize / 2 - 5))
      const y = Math.max(boxSize / 2 + 5, Math.min(mouseY, canvasHeight - boxSize / 2 - 5))

      // Using Body.setPosition according to Matter.js docs
      Matter.Body.setPosition(technologyBodies[draggedIndex], { x, y })

      // Set rotation to 0 while dragging for better control
      Matter.Body.setAngle(technologyBodies[draggedIndex], 0)
      Matter.Body.setAngularVelocity(technologyBodies[draggedIndex], 0)
    }

    const handleMouseUp = () => {
      if (draggedIndex !== null && technologyBodies[draggedIndex]) {
        // Stop all motion before making it non-static
        Matter.Body.setAngularVelocity(technologyBodies[draggedIndex], 0)
        Matter.Body.setVelocity(technologyBodies[draggedIndex], { x: 0, y: 0 })

        // Only when released, make the body non-static so it falls
        Matter.Body.setStatic(technologyBodies[draggedIndex], false)

        // Apply a small downward velocity when released
        Matter.Body.setVelocity(technologyBodies[draggedIndex], {
          x: 0,
          y: RELEASED_DOWNWARD_VELOCITY, // Very gentle downward motion
        })
      }
      setDraggedIndex(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      // If dragging is interrupted (e.g., component unmount during drag)
      // make sure to reset the body to non-static
      if (technologyBodies[draggedIndex]) {
        Matter.Body.setAngularVelocity(technologyBodies[draggedIndex], 0)
        Matter.Body.setVelocity(technologyBodies[draggedIndex], { x: 0, y: 0 })
        Matter.Body.setStatic(technologyBodies[draggedIndex], false)
      }
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggedIndex, technologyBodies])

  // Handle ref callbacks properly to avoid TS errors
  const setElementRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      visualElementsRef.current[index] = el
    },
    [],
  )

  // Add a mouse interaction handler to wake up objects
  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!sceneRef.current || !engineRef.current || !technologyBodies.length) return

      const rect = sceneRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Wake up nearby bodies
      technologyBodies.forEach((body) => {
        const dx = body.position.x - mouseX
        const dy = body.position.y - mouseY
        const distance = Math.sqrt(dx * dx + dy * dy)

        // If mouse is near a body, wake it up
        if (distance < boxSize * 1.5) {
          Matter.Sleeping.set(body, false)
        }
      })
    },
    [technologyBodies],
  )

  return (
    <div className="font-['Press_Start_2P'] p-8">
      <h3 className="text-3xl font-extrabold text-primary  pb-8 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)]">
        TECHNOLOGIES
      </h3>
      <div className="relative flex justify-center items-center w-full mb-8">
        {/* Physics container */}
        <div
          ref={sceneRef}
          className="relative overflow-hidden w-full"
          style={{
            width: '100%',
            maxWidth: MAX_CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            backgroundColor: '#fdf6e3',
            border: '2px dashed #2c2c2c',
            boxShadow: '0 0 0 8px #b58900, 8px 8px 0 0 #2c2c2c',
            imageRendering: 'pixelated',
            outline: '4px solid #fffbe3',
            borderRadius: 0,
          }}
          onMouseMove={handleCanvasMouseMove}
        >
          {/* Overlay tech icons and titles */}
          {renderReady && technologyBodies.length === technologies.length && (
            <>
              {technologies.map((tech, i) => {
                const Icon = RiIcons[tech.icon as keyof typeof RiIcons]
                if (!Icon) return null

                return (
                  <div
                    key={tech.title}
                    ref={setElementRef(i)}
                    className="absolute flex flex-col items-center justify-center transform-gpu"
                    style={{
                      width: boxSize,
                      height: boxSize,
                      cursor: draggedIndex === i ? 'grabbing' : 'grab',
                      zIndex: 10,
                      userSelect: 'none',
                      touchAction: 'none',
                      transformOrigin: 'center center',
                      pointerEvents: 'auto',
                      transition: 'none',
                      // Ensure text doesn't overflow
                      overflow: 'hidden',
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setDraggedIndex(i)
                    }}
                  >
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <Icon
                        size={64}
                        color="#b58900"
                        style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}
                      />
                      <span
                        className="text-xl text-black/60 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)] mt-2 text-center whitespace-nowrap"
                        style={{
                          maxWidth: '90%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: '14px', // Smaller font size for better fit
                        }}
                      >
                        {tech.title}
                      </span>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
