# Pixel Collisions Background

A performant React component for animated, colorful pixel-art squares with realistic physics and collision detection. Designed for visually rich, non-blocking backgrounds in modern web apps.

## Structure

This module is organized into the following files:

- `index.tsx` - Main entry point that exports the component and types
- `PixelArtAnimation.tsx` - Main animation component and physics loop
- `DebugOverlay.tsx` - Optional SVG overlay for debugging physics/collisions
- `types.ts` - TypeScript type definitions for all core data structures
- `constants.ts` - Animation and visual constants
- `utils.ts` - Optimized geometry, collision, and physics helper functions

## Usage

```tsx
import PixelArtAnimation from '@/frontend/components/animation/pixel-collisions-bg';

const MyComponent = () => (
  <div>
    <PixelArtAnimation 
      numSquares={15}
      sizeRange={[10, 25]}
      opacity={0.6}
      debug={false}
    />
    <div className="z-10 relative">Your content here</div>
  </div>
);
```

## Props

| Prop                | Type            | Default         | Description                                 |
|---------------------|-----------------|-----------------|---------------------------------------------|
| numSquares          | number          | 20              | Number of squares to render (max 20)        |
| sizeRange           | [number,number] | [10, 25]        | Min and max size for squares                |
| colors              | string[]        | DEFAULT_COLORS  | Array of colors for the squares             |
| interactionDistance | number          | 150             | Distance for mouse interaction              |
| className           | string          | ''              | Additional CSS classes                      |
| opacity             | number          | 1               | Opacity of the squares                      |
| debug               | boolean         | false           | Show debug visualization overlay            |

## Physics & Performance

- **Collision Detection:** Uses the Separating Axis Theorem (SAT) for accurate detection between rotated squares. Only 2 unique axes per square are checked for efficiency.
- **Geometry Caching:** Rotated corners and axes are calculated once per frame per square, not per collision, for optimal performance.
- **Broadphase Optimization:** Spatial partitioning (grid-based) is used to reduce the number of collision checks from O(n²) to nearly O(n).
- **Realistic Physics:** Conservation of momentum, angular velocity, and edge wrapping are implemented. Mass and inertia are size-dependent.
- **Maximum Squares:** The animation is capped at 20 squares for performance and visual clarity. For best results on low-end devices, use fewer squares and larger sizes.

## Code Quality & Documentation

- **TypeScript:** All logic is fully typed for safety and editor support.
- **JSDoc:** All important utility functions are documented with JSDoc comments. See [`utils.ts`](./utils.ts) for technical details on geometry and collision logic.
- **No Redundancy:** All redundant or duplicate functions have been removed. The code is DRY, maintainable, and easy to extend.

## Extending or Contributing

- To add new shapes or effects, extend the geometry and collision logic in `utils.ts` and update the main animation loop in `PixelArtAnimation.tsx`.
- For custom debug overlays, modify or extend `DebugOverlay.tsx`.
- Please keep all new code typed and documented with JSDoc for consistency.

## More Information

- For technical details on the SAT algorithm, geometry math, and performance optimizations, see the JSDoc comments in [`utils.ts`](./utils.ts).
- For questions or contributions, open an issue or PR.
