# ui

This folder contains all React UI components for the TypoSync game that are rendered on top of the Three.js 3D canvas. These components provide the interactive user interface, game controls, overlays, and statistics panels that complement the 3D gameplay experience.

## Purpose

- **React UI Layer:** Centralizes all React-based UI elements that are displayed above or alongside the Three.js game canvas.
- **Game Controls & Feedback:** Implements controls for file upload, map generation, and playback, as well as real-time overlays and feedback for the player.
- **Separation of Concerns:** Keeps UI logic and presentation separate from the 3D rendering logic, making the system modular and maintainable.

## Key Components

- **GameControls.tsx**  
  Provides the main game control panel, including audio file upload, keystroke map generation, and playback mode selection.

- **KeyboardLayout.tsx**  
  Shows a visual keyboard layout for finger positioning and a heatmap of key usage, adapting to the current game state.

- **DemoSelector.tsx**  
  Lets users select and load pre-made demo levels (Medium, Hard, Expert) for TypoSync. Handles demo map/audio loading, state updates, and error handling. Useful for quickly experiencing the game without uploading custom files.  

- **overlay/**  
  Contains overlay UI components rendered above the main game, such as:
  - **PauseOverlay.tsx**: Displays a modal overlay when the game is paused, with options to resume or stop the game.
  - **PostGameStatsOverlay.tsx**: Shows detailed statistics and insights after a game session ends.
  - **InGameOverlay.tsx**  Renders live overlays during gameplay, including progress bars, score, WPM, accuracy, streak, reaction time, and upcoming words.

## Usage

These components are used to build the interactive UI for the TypoSync game, providing controls, feedback, and visualizations that enhance the player's experience. They are designed to work in tandem with the 3D canvas but are implemented purely in React.

- All components are written as React function components using hooks.
- They use Tailwind CSS and custom styles for pixel-art and retro aesthetics.
- Components are modular and can be composed as needed in the main game UI.

## Extending

To add new UI features or panels:

- Create a new component in this folder or in the `overlay/` subfolder for overlays.
- Use the existing components as reference for integrating with the TypoSync game state and events.
