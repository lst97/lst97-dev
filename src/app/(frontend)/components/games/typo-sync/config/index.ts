import type { GameConfig } from '../types'

export const GAME_CONFIG: GameConfig = {
  NOTE_SPEED_PPS: 300,
  HIT_ZONE_X: 150,
  NOTE_FONT: '32px Consolas',
  COLORS: {
    UPCOMING: '#FFFFFF',
    HIT: '#00FF00',
    MISSED: '#FF0000',
    TYPO: '#FFA500',
    HIT_ZONE: '#00FFFF',
    SYNC: '#00FF00',
    LATE: '#FF0000',
    EARLY: '#FF0000',
    OFF: '#000000',
  },
  TIMING_WINDOWS: {
    SYNC: 0.05,
    LATE_EARLY: 0.15,
    HIT: 0.15, // 150ms window for hit
    TYPO: 0.25, // 250ms window for typo detection
    IGNORE: 0.5, // 500ms - beyond this, ignore the key press
  },
  SCORING: {
    SYNC: 100,
    LATE_EARLY: 50,
    TYPO: -25,
    OFF: -50,
  },
}

export const CANVAS_WIDTH = 800
export const CANVAS_HEIGHT = 150

/**
 * Converts 2D screen coordinates (pixels) to 3D world coordinates for the game canvas.
 *
 * @param screenX - The X coordinate on the screen (in pixels)
 * @param screenY - The Y coordinate on the screen (in pixels)
 * @returns An object with x, y, z properties representing the world coordinates
 */
export function screenToGameSpace(screenX: number, screenY: number) {
  const worldX = (screenX / CANVAS_WIDTH) * 16 - 8
  const worldY = -(screenY / CANVAS_HEIGHT) * 3 + 1.5
  return { x: worldX, y: worldY, z: 0 }
}

/**
 * Converts 3D world coordinates to 2D screen coordinates (pixels) for the game canvas.
 *
 * @param worldX - The X coordinate in world space
 * @param worldY - The Y coordinate in world space
 * @returns An object with x, y properties representing the screen coordinates (in pixels)
 */
export function gameSpaceToScreen(worldX: number, worldY: number) {
  const screenX = (worldX + 8) * (CANVAS_WIDTH / 16)
  const screenY = (-worldY + 1.5) * (CANVAS_HEIGHT / 3)
  return { x: screenX, y: screenY }
}
