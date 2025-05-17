# File Type Detector Component

The File Type Detector is a React component designed for client-side file type identification. It leverages a dual-engine approach, combining Google's AI-powered Magika library with the traditional signature-based `file-type` library to provide robust and accurate file type detection directly in the browser.

## Features

* **Dual-Engine Detection:**
  * **AI Engine (Magika):** Utilizes Google's deep learning model for content-aware file type identification, capable of recognizing over 200 file types.
  * **Algorithm Engine (`file-type`):** Employs traditional signature-based detection by examining file headers for common formats.
* **Client-Side Processing:** All file analysis occurs locally in the user's browser, ensuring privacy and eliminating server-side load for this task.
* **Batch Processing:** Files are processed in small, configurable batches with slight delays to prevent UI freezing and maintain a responsive user experience, especially when handling multiple or large files.
* **Comprehensive Results:** For each file, the component provides:
  * Detected file type label, description, and MIME type.
  * Confidence score and level (high, medium, low).
  * Indication of whether both engines agreed on the result.
  * Potential file extensions.
  * Information on whether the file is text-based.
  * Warning messages for low confidence, engine disagreements, or potential obfuscation.
  * Detailed breakdown of individual results from both Magika and `file-type` engines.
* **User-Friendly Interface:**
  * Drag & drop and file browse capabilities for easy uploading.
  * Real-time list of files being processed with their status.
  * Clear presentation of detection results in individual cards.
  * A non-intrusive notice about potential UI lag during intensive AI processing.
* **Error Handling:** Displays errors for individual file processing failures.
* **Modern Styling:** Utilizes Tailwind CSS for a consistent and responsive design.

## Component Structure

The component is organized into several key parts:

* **`FileTypeDetector.tsx`:** The main parent component that orchestrates the UI, manages overall state (like drag activity), and integrates the various sub-components and hooks.

* **UI Components (`./components/interface/`)**
  * **`FileUploadSection.tsx`:** Handles the file input mechanism, including drag & drop and browse functionality.
  * **`FileProcessingList.tsx`:** Displays a list of files currently in the processing queue or actively being analyzed, showing their name, size, and status (queued, processing, completed, error).
  * **`ResultsSection.tsx`:** Renders the detection results for each processed file in a card-based layout, allowing users to view detailed information.
  * **`ProcessingNotice.tsx`:** A small, dismissible notice that appears during file processing to inform the user about potential temporary UI lag due to the intensive nature of client-side AI analysis.

* **Logic & State Management (`./hooks/`)**
  * **`useFileDetection.ts`:** A custom React hook that encapsulates all the core logic for file processing. This includes:
    * Managing the queue of files to be processed.
    * Initializing the detection engines.
    * Processing files in batches.
    * Invoking the `CombinedDetector`.
    * Updating the state with processing progress and final detection results.
    * Handling errors during detection.

* **Detection Engines (`./engine/`)**
  * **`magika.ts` (`MagikaEngine`):** Wraps Google's Magika library. It handles the initialization of the Magika model and provides a method to detect file types based on file content using deep learning.
  * **`fileType.ts` (`FileTypeEngine`):** Wraps the `file-type` library. It initializes the module (via dynamic import) and detects file types by matching known file signatures (magic numbers) at the beginning of the file.
  * **`combinedDetector.ts` (`CombinedDetector`):** The core detection orchestrator. It initializes both `MagikaEngine` and `FileTypeEngine`. When detecting a file type, it runs both engines in parallel and then uses a reconciliation logic to determine the most accurate result, considering the strengths and limitations of each engine.

* **Types (`./types.ts`)**
  * Defines TypeScript interfaces for various data structures used throughout the component, such as `ProcessingFile`, `DetectionResult`, and types related to the engine outputs.

* **Index Files (`./index.ts`, `./components/index.ts`, etc.)**
  * Used for convenient barrel exports, simplifying import paths.

## Detection Algorithm & Flow

1. **File Input:**
    * The user selects files via the `FileUploadSection` (drag & drop or browse).
    * The selected `File` objects are passed to the `handleFiles` function provided by the `useFileDetection` hook.

2. **Processing Pipeline (`useFileDetection` hook):**
    * **Queueing:** Each file is assigned a unique ID and added to a processing queue as a `ProcessingFile` object with an initial status of 'queued'. The UI (`FileProcessingList`) updates to show these files.
    * **Initialization:** If not already done, the `CombinedDetector` (and subsequently `MagikaEngine` and `FileTypeEngine`) is initialized. This involves loading the Magika model and the `file-type` module.
    * **Batching:** The `processBatch` function takes a small number of files (e.g., `BATCH_SIZE = 3`) from the queue.
    * **Processing:** For each file in the batch, the `processFile` function is called:
        * The file's status is updated to 'processing'.
        * The `CombinedDetector.detectFileType()` method is invoked.

3. **Dual-Engine Analysis (`CombinedDetector.detectFileType()`):**
    * Both `MagikaEngine.detectFileType()` and `FileTypeEngine.detectFileType()` are executed in parallel for the given file.
    * **Magika Engine:**
        * Reads the file content as a `Uint8Array`.
        * Uses `magikaInstance.identifyBytes()` to get a prediction, score, and detailed information (MIME type, group, description, extensions).
        * Includes a confidence check (e.g., if the score is low or the type isn't well-represented in Magika's internal scores map).
    * **File-Type Engine:**
        * Reads the file as an `ArrayBuffer`.
        * Uses `fileTypeModule.fileTypeFromBuffer()` to identify the type based on its signature.
        * Normalizes the result, providing a label, MIME type, description, and group.
    * **Result Reconciliation:**
        * The `CombinedDetector` analyzes the outputs from both engines:
            * **Agreement:** If both engines agree on the file type, this result is used with high confidence.
            * **Disagreement & Magika Support:** If they disagree, and the type detected by `file-type` is one that Magika doesn't explicitly support (and `file-type` itself is confident), the `file-type` result might be preferred. This is useful for formats Magika isn't trained on but `file-type` knows by signature.
            * **Magika Priority:** Generally, Magika's result is prioritized due to its content-aware analysis, especially if `file-type` yields 'unknown' or has low confidence.
            * **Low Magika Confidence Fallback:** If Magika's confidence is low or it fails to detect, and `file-type` provides a valid, supported detection (especially if it's a type not in Magika's detailed `scores_map`), the `file-type` result can be used as a fallback or to boost confidence if they agree on the label.
        * A final `CombinedDetectionResult` is formulated, including the chosen label, description, MIME type, group, overall score, confidence level ('high', 'medium', 'low'), any warning messages, and the raw results from both engines for transparency.

4. **UI Updates & Results Display:**
    * Back in `useFileDetection`, upon completion (or error) of `processFile`:
        * The file's status in `processingFiles` is updated to 'completed' or 'error'.
        * The `DetectionResult` is added to the `detectionResults` state.
    * The `FileProcessingList` updates to reflect the file's completion or error state.
    * The `ResultsSection` displays the new `DetectionResult` as a card, showing summarized information. Users can expand the card to see detailed engine outputs and other metadata.
    * The `ProcessingNotice` may appear or update its count of actively processing files.
    * Once the queue is empty, `isProcessing` is set to false.

## How it Works (Simplified)

The component employs a "best-of-both-worlds" strategy:

1. **AI Smarts (Magika):** Google's Magika looks deep into the *content* of the file, much like a human expert might, to figure out what it is. This is great for complex or less obvious file types.
2. **Pattern Matching (file-type):** The `file-type` library checks the very beginning of the file for known "fingerprints" or "magic numbers" that identify common file types (like how a `.PNG` image starts with specific bytes).

**Decision Logic:**

* **Agreement is Key:** If both Magika and `file-type` agree, we're very confident (<FaCheckCircle />).
* **Specialized Knowledge:** If Magika doesn't really know about a type that `file-type` confidently identifies (e.g., a very niche archive format Magika wasn't trained on), we might trust `file-type`.
* **AI's Wider Net:** Often, Magika's content analysis is preferred, especially if `file-type` is unsure.
* **Warnings:** If the engines disagree significantly, or if one has very low confidence, a warning (<FaExclamationTriangle />) might be shown, suggesting the file could be unusual or obfuscated.
* The system tries to provide the most reliable detection, defaulting to Magika's more sophisticated analysis but using `file-type` as a valuable second opinion or for cases outside Magika's extensive but not exhaustive knowledge.

## Usage

To use the `FileTypeDetector` component:

```tsx
import { FileTypeDetector } from '@/frontend/components/tools/file-type'; // Adjust path as needed

const MyPage = () => {
  return (
    <div>
      <h1>My File Detection Tool</h1>
      <FileTypeDetector />
    </div>
  );
};

export default MyPage;
```

The component is self-contained and manages its own state for file processing and results.

## Dependencies

* **`magika`**: Google's AI-powered file type identification library.
  * The specific import path `node_modules/magika/dist/mjs/magika.js` is crucial for the build process due to how the library is packaged and used client-side.
* **`file-type`**: A popular library for detecting file types from ArrayBuffers/Uint8Arrays based on magic numbers.
* **`react`**: For building the user interface.
* **`framer-motion`**: For animations.
* **`react-icons`**: For icons.
* **`uuid`**: For generating unique IDs for files.
* **Tailwind CSS**: For styling.

## Local Development

Ensure all dependencies are installed using `pnpm install`. The component relies on client-side capabilities, so it should be run and tested within a browser environment. The Magika model and `file-type` module are loaded dynamically to work in the browser.
