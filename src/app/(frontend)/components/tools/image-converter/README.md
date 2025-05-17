# Image Converter Component

## Overview

The `ImageConverter` is a client-side React component designed for converting images between various formats directly in the browser. It supports popular formats like JPEG, PNG, WEBP, GIF, and HEIC, offering features like batch processing, quality control, metadata display, and ZIP downloads.

## Features

* **Format Conversion**: Supports conversion between JPEG, PNG, WEBP, GIF. HEIC files are automatically converted to JPEG or PNG upon upload for broader compatibility and further conversion.
* **File Upload**:
  * Drag-and-drop interface.
  * Click-to-select file dialog.
  * Supports multiple file uploads.
* **Image Processing**:
  * **Client-Side HEIC Conversion**: Uses `heic-convert/browser` to convert HEIC/HEIF files to JPEG or PNG.
  * **Canvas API & `gif.js`**: Leverages the browser's Canvas API for standard image conversions (JPEG, PNG, WEBP) and `gif.js` for GIF creation.
  * **Quality Control**: Adjustable quality settings (10-100%) for lossy formats like JPEG and WEBP.
  * **Batch Processing**: Converts multiple images efficiently.
  * **Individual Conversion**: Option to convert a single selected image.
* **User Interface**:
  * **Image Previews**: Displays thumbnails of uploaded images and a larger preview of the selected image.
  * **Image Navigation**: Easy navigation through uploaded images.
  * **Metadata Display**: Shows technical (EXIF), descriptive (IPTC/XMP), and GPS metadata extracted using `ExifReader`.
  * **Progress Tracking**: Visual feedback for file reading, preview generation, and metadata extraction.
  * **Processing Notice**: Informs users about potential UI lag during intensive client-side processing.
  * **Error Handling**: Displays global and per-image error messages.
* **Download Options**:
  * Download individual converted images.
  * Download all converted images as a single ZIP archive.
  * Download selected converted images as a ZIP archive (using `JSZip`).
* **Automatic Target Format Suggestion**: Intelligently suggests a different target format if the source and target are the same, or defaults HEIC to JPEG. Users can manually override this.

## Component Structure

The `ImageConverter` is composed of several interconnected parts:

* **`ImageConverter.tsx`**: The main component that orchestrates the state and logic.
* **Sub-components (`./components/interface/`)**:
  * `UploadSection.tsx`: Handles file input (drag & drop, click).
  * `ImageGallery.tsx`: Displays thumbnails of uploaded images.
  * `ConversionInterface.tsx`: The core UI for selecting an image, choosing conversion options, and viewing metadata. It includes:
    * `ImagePreviewWithNav.tsx`: Shows the selected source image with navigation controls.
    * `ImageMetadataPanel.tsx`: Displays detailed metadata for source and target images.
    * `FormatSelectionPanel.tsx`: Allows users to choose the target format.
    * `QualityControl.tsx`: Slider for adjusting image quality.
    * `ConversionButtons.tsx`: Buttons to trigger single or batch conversions.
  * `ConvertedImageGallery.tsx`: Displays thumbnails of successfully converted images with download options.
  * `FileUploadProgressList.tsx`: Shows the progress of files being processed (read, previewed, metadata extracted).
  * `ProcessingNotice.tsx`: A non-intrusive notice about potential UI lag during heavy processing.
  * `NonBlockingSpinner.tsx`: A lightweight canvas-based spinner.
* **Hooks (`./hooks/`)**:
  * `useFileProcessor.ts`: Manages the asynchronous processing of uploaded files (reading, HEIC conversion, preview generation, metadata extraction) in batches.
  * `useImageProcessing.ts`: Handles the actual image conversion logic using engine functions.
  * `useDownloadHandler.ts`: Manages downloading single images and creating/downloading ZIP archives.
  * `useImageMetadata.ts`: Extracts metadata and dimensions from image files.
  * `useImageNavigation.ts`: Logic for navigating between images and removing them.
* **Engine (`./components/engine/`)**:
  * `imageConverter.ts`: Core conversion logic using Canvas API and `gif.js`. Includes `getConversionPath` to determine multi-step conversions.
  * `heicConverter.ts`: Client-side HEIC to JPEG/PNG conversion using `heic-convert/browser`.
* **Services (`./services/`)**:
  * `imageConversionService.ts`: Utility functions related to image processing, like HEIC handling wrappers and ID generation.
  * `imageMetadata.ts`: Functions for extracting metadata and dimensions using `ExifReader` and the `Image` API.
* **Types (`./types/` or `./types.ts`)**: Defines TypeScript interfaces and types used throughout the component (e.g., `ImageInfo`, `SupportedFormat`, `ProcessingFile`).

## Workflow and Logic

1. **File Upload**:
    * User drops or selects image files. `UploadSection` captures these.
    * `handleFiles` in `ImageConverter.tsx` calls `processFiles` from `useFileProcessor`.
    * `useFileProcessor` queues files and displays their initial status in `FileUploadProgressList`.
    * A `ProcessingNotice` may appear if many files are being processed, indicating potential UI lag due to main thread activity.

2. **File Pre-processing (`useFileProcessor`)**:
    * Files are processed in batches to avoid freezing the UI. `requestIdleCallback` is used if available.
    * **Status Update**: `FileUploadProgressList` reflects the current stage (reading, generating preview, extracting metadata).
    * **HEIC Handling**: If a file is HEIC/HEIF, `convertHeicOnClient` (which uses `clientSideHeicConvertor` from `heicConverter.ts`) attempts to convert it to JPEG. The original file type (`image/heic`) is stored.
    * **Preview Generation**: A local preview URL is generated using `URL.createObjectURL()`.
    * **Metadata Extraction**: `extractMetadataFromImage` (from `useFileProcessor`, utilizing services from `imageMetadata.ts` and `ExifReader`) parses EXIF, IPTC, and XMP data. Dimensions are also determined.
    * Once pre-processing is complete for a file, an `ImageInfo` object is created.
    * Processed `ImageInfo` objects are passed via `onFilesProcessed` callback and added to the main `images` state in `ImageConverter.tsx`.

3. **Displaying Uploaded Images**:
    * `ImageGallery` displays thumbnails of all `ImageInfo` objects.
    * The first image is auto-selected, or the selection persists/updates as images are added/removed.
    * The `ConversionInterface` displays the selected image's preview (`ImagePreviewWithNav`) and its metadata (`ImageMetadataPanel`).

4. **Conversion Process (`ConversionInterface` & `useImageProcessing`)**:
    * The user selects a `targetFormat` and (if applicable) `quality`.
        * The `targetFormat` automatically adjusts if the source format is the same as the target (e.g., JPEG -> WEBP if JPEG is selected for a JPEG source), unless the user has manually selected a format.
        * For HEIC files, the default target is often JPEG.
    * The user clicks "Convert Selected Image" or "Convert All Images".
    * `useImageProcessing`'s `convertSingleImage` function is called for each image:
        * It determines the `sourceFormat` (using `originalType` if it was HEIC).
        * `getConversionPath` (from `imageConverter.ts`) determines if intermediate conversion steps are needed (e.g., for some GIF conversions).
        * `convertImageThroughPath` (from `imageConverter.ts`) iterates through the path, calling `convertImageFormat`.
        * `convertImageFormat` uses `document.createElement('canvas')` to draw the image and `canvas.toBlob()` to get the image in the desired format and quality.
        * For GIF conversion, `createGif` (from `imageConverter.ts`) uses the `gif.js` library.
    * The `convertedUrl` (a blob URL) and updated file information (including new size) are stored in the respective `ImageInfo` object.
    * Conversion errors are caught and displayed.

5. **Displaying Converted Images**:
    * `ConvertedImageGallery` shows thumbnails of images that have a `convertedUrl`.
    * Users can select one or more converted images for batch download.

6. **Download (`ConvertedImageGallery` & `useDownloadHandler`)**:
    * `downloadImage`: Downloads a single image by creating an anchor tag with the `convertedUrl`.
    * `downloadAllImages` / `downloadSelectedImages`:
        * Uses `JSZip` to create a ZIP archive in the browser.
        * Blobs for converted images are fetched (if necessary from blob URLs) and added to the ZIP.
        * The generated ZIP blob is downloaded.
        * Indicates `isZipping` status.

## Key Algorithms & Techniques

* **Client-Side HEIC Conversion**: `heic-convert/browser` library.
* **Canvas API**: Used for image manipulation (drawing) and format conversion (`canvas.toBlob()`).
* **`gif.js`**: Library for client-side GIF encoding.
* **`ExifReader`**: For parsing EXIF, IPTC, and XMP metadata from image files.
* **`JSZip`**: For creating ZIP archives entirely in the browser.
* **Batch Processing & UI Responsiveness**:
  * `useFileProcessor` processes uploaded files in small batches.
  * `requestIdleCallback` (when available) or `setTimeout` is used between batches to yield to the main thread, preventing UI freezes.
* **Blob URLs (`URL.createObjectURL()`)**: Used for image previews and for handling converted image data before download. These are revoked when no longer needed to free up memory.
* **Asynchronous Operations**: Extensive use of `async/await` for handling file reading, conversions, and other I/O-bound tasks.
* **State Management**: Relies on React's built-in state (`useState`, `useRef`) and effect (`useEffect`, `useCallback`) hooks. Custom hooks encapsulate complex logic domains.

## Usage

To use the `ImageConverter` component, simply import it and render it in your application:

```tsx
import { ImageConverter } from '@/frontend/components/tools/image-converter';

const MyPage = () => {
  return (
    <div>
      <h1>Image Conversion Tool</h1>
      <ImageConverter />
    </div>
  );
};

export default MyPage;
```

### Dependencies

The component relies on a few external libraries:

* `framer-motion`: For animations.
* `heic-convert`: For HEIC to JPEG/PNG conversion.
* `gif.js`: For GIF creation. (Note: `gif.worker.js` should be available in the `public/workers/` directory).
* `jszip`: For creating ZIP archives.
* `exifreader`: For extracting image metadata.
* `react-icons`: For icons.
* `uuid`: For generating unique IDs.

Internal UI components like `PixelScrollArea`, `PixelCheckbox`, `PixelSlider` are assumed to be available from `@/frontend/components/ui`.

## Error Handling

* **Global Errors**: `useFileProcessor` can report errors during the initial file handling phase (e.g., unsupported file type, read errors), displayed at the top.
* **Conversion Errors**: Each `ImageInfo` object can store a `convertError` message, displayed if a specific image fails during the conversion step.
* **Download Errors**: Alerts may be shown if zipping or downloading fails.

## Performance Considerations

* **Client-Side Focus**: All processing (including HEIC conversion and ZIP creation) is done client-side, reducing server load but potentially impacting browser performance for very large files or large batches.
* **Batching**: File pre-processing (`useFileProcessor`) is batched to improve UI responsiveness. Image conversion (`useImageProcessing` for "Convert All") also processes in batches.
* **Memory Management**: `URL.revokeObjectURL()` is used where appropriate to free memory from blob URLs.
* **Lightweight Spinner**: `NonBlockingSpinner` uses the Canvas API and `requestAnimationFrame` for a smoother animation during processing that is less likely to be janked by main thread work.
* **Processing Notice**: The `ProcessingNotice` explicitly informs users that the browser's main thread is being used for decoding and processing, which can cause temporary UI lag, managing user expectations.
