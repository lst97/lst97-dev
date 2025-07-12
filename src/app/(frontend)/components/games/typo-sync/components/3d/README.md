# 3d

This folder contains all Three.js-based animation and UI components for the TypoSync game, built using React Three Fiber. It is the main location for 3D visual effects, interactive elements, and animated UI that enhance the gameplay experience.

## Purpose

- **Three.js Animation & UI:** Centralizes all 3D and animated UI elements powered by Three.js and React Three Fiber.
- **Visual Feedback:** Provides dynamic, real-time 3D feedback for player actions (hits, misses, typos, etc.).
- **Game Effects:** Implements background effects, animated notes, hit zone visuals, and particle bursts to create an immersive rhythm game experience.
- **Componentization:** Each file represents a specific 3D element or effect, making the system modular and maintainable.

## Key Components

- **BackgroundEffect.tsx**  
  Renders animated background effects that respond to player timing and accuracy, using custom shaders for visual feedback.

- **PixelParticle.tsx**  
  Represents individual 3D particles (pixel shards, fire, etc.) used in burst and break effects when notes are hit or missed.

- **HiddenNoteBurst.tsx**  
  Triggers a burst of particles when a hidden note is revealed or interacted with.

- **HitZone.tsx**  
  Renders the 3D hit zone indicator, including visual feedback for timing and beat synchronization.

- **KeystrokeNote.tsx**  
  Displays each falling note as a 3D object, handling its animation, state transitions, and break effects (with particle bursts) on hit/miss/typo.

## Usage

These components are used within the TypoSync game renderer to provide immersive, interactive 3D feedback. They are not standalone and rely on the game’s state and configuration.

- All components are written as React function components using hooks.
- They use `@react-three/fiber` for animation and scene updates.
- Some components use custom shaders for advanced visual effects.

## Dependencies

- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Three.js](https://threejs.org/)
- [@react-three/drei](https://github.com/pmndrs/drei) (for helpers like `<Text>` and `<Box>`)

## Extending

To add new 3D effects or visuals:

- Create a new component in this folder.
- Use the existing components as reference for integrating with the TypoSync game state and animation loop.
