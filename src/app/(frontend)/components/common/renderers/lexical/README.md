# Lexical Renderer Component

This directory contains a component for rendering Lexical JSON content with pixel art styling using Tailwind CSS.

## Structure

- `LexicalRenderer.tsx` - Main component that uses all subcomponents to parse and render Lexical JSON.
- `/components` - Contains individual React components for rendering different Lexical node types:
  - `Paragraph` - Renders paragraph nodes, now with enhanced handling for code blocks.
  - `Heading` - Renders h1-h6 heading nodes.
  - `List` - Renders ordered, unordered, and checklist nodes.
  - `Link` - Renders hyperlinks with pixel underline effect, supporting URLs from different node properties.
  - `Quote` - Renders blockquotes with pixel quote decorations.
  - `Code` - Renders code blocks with language headers and syntax highlighting using highlight.js. Supports various code block formats including markdown-style and multi-line blocks.
  - `Image` - Renders images with pixel borders.
  - `TextFormat` - Handles text formatting (bold, italic, underline, etc.) and text alignment.
  - `NodeRenderer` - Recursively renders child nodes, now with special handling for nested links.
- `/utils` - Helper functions and types:
  - `types.ts` - TypeScript interfaces for Lexical nodes, including added properties for code blocks and links.
  - `formatHelpers.ts` - Helper functions for text alignment and extraction, now supporting string-based alignment.

## Usage

```tsx
import { LexicalRenderer } from '@/components/common/renderers/lexical'

// With a Lexical JSON string
const lexicalContent = '{"root": {"children": [...]}}'

// In your component
<LexicalRenderer content={lexicalContent} />

// Or with a parsed Lexical JSON object
const lexicalObject = {
  root: {
    children: [...]
  }
}

<LexicalRenderer content={lexicalObject} />
```

## Styling

All components use Tailwind CSS for pixel art styling and rely on CSS variables for theming:

- `--color-text` - Text color in light mode
- `--color-text-light` - Text color in dark mode
- `--color-card` - Card background in light mode
- `--color-card-dark` - Card background in dark mode
- `--color-border` - Border color in light mode
- `--color-border-dark` - Border color in dark mode
- `--color-accent` - Accent color (used for pixel elements)
- `--shadow` - Shadow color

Code blocks are styled to resemble a terminal window with pixel borders and a language header, similar to the `CodeBlockRenderer.tsx` component.

## Features

- Supports standard Lexical node types (Paragraph, Heading, List, Link, Quote, Code, Image, Text).
- Pixel art styling with Tailwind CSS and CSS variables.
- Dark mode support.
- Custom pixel underlines for links.
- Pixelated borders and checkboxes.
- Extract plain text content from Lexical JSON.
- **Enhanced Code Block Rendering:**
  - Supports syntax highlighting using highlight.js.
  - Detects and renders various code block formats, including single-node, multi-line, and markdown-style blocks.
  - Includes a copy-to-clipboard button with visual feedback.
  - Displays the programming language in the header.
- **Improved Link Handling:**
  - Extracts URLs and new tab settings from different node properties (url and fields object).
  - Properly renders nested links within other nodes.
- **Flexible Text Alignment:**
  - Supports both numeric and string-based format values for text alignment.
