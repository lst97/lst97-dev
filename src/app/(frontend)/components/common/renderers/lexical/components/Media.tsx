import React from 'react'
import Image from 'next/image'
import { LexicalMediaNode } from '../types'

interface MediaProps {
  node: LexicalMediaNode
  index: number
}

export const Media: React.FC<MediaProps> = ({ node, index }) => {
  const { value } = node

  if (!value || !value.url) {
    return (
      <div
        key={`media-error-${index}`}
        className="my-4 p-4 border-2 border-[var(--color-error)] bg-[var(--color-error-bg)] text-[var(--color-error)] font-['Press_Start_2P'] text-xs"
        style={{ imageRendering: 'pixelated' }}
      >
        Media not found
      </div>
    )
  }

  // Handle different media types
  const isImage = value.mimeType?.startsWith('image/')
  const isVideo = value.mimeType?.startsWith('video/')
  const isAudio = value.mimeType?.startsWith('audio/')

  if (isImage) {
    return (
      <div key={`media-${index}`} className="my-6 flex justify-center">
        <div className="relative border-2 border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-card-bg)] dark:bg-[var(--color-card-bg-dark)] p-2">
          <Image
            src={value.url}
            alt={value.alt || value.filename || 'Media'}
            width={value.width || 400}
            height={value.height || 300}
            className="max-w-full h-auto"
            style={{
              imageRendering: 'pixelated',
              maxWidth: '100%',
              height: 'auto',
            }}
            priority={false}
          />
          {value.alt && (
            <div className="mt-2 text-xs text-[var(--color-text-muted)] dark:text-[var(--color-text-muted-dark)] font-['Press_Start_2P'] text-center">
              {value.alt}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isVideo) {
    return (
      <div key={`media-${index}`} className="my-6 flex justify-center">
        <div className="relative border-2 border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-card-bg)] dark:bg-[var(--color-card-bg-dark)] p-2">
          <video
            src={value.url}
            controls
            className="max-w-full h-auto"
            style={{
              imageRendering: 'pixelated',
              maxWidth: '100%',
              height: 'auto',
            }}
            width={value.width || 400}
            height={value.height || 300}
          >
            Your browser does not support the video tag.
          </video>
          {value.alt && (
            <div className="mt-2 text-xs text-[var(--color-text-muted)] dark:text-[var(--color-text-muted-dark)] font-['Press_Start_2P'] text-center">
              {value.alt}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isAudio) {
    return (
      <div key={`media-${index}`} className="my-6 flex justify-center">
        <div className="relative border-2 border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-card-bg)] dark:bg-[var(--color-card-bg-dark)] p-4">
          <audio
            src={value.url}
            controls
            className="w-full"
            style={{ imageRendering: 'pixelated' }}
          >
            Your browser does not support the audio tag.
          </audio>
          {value.alt && (
            <div className="mt-2 text-xs text-[var(--color-text-muted)] dark:text-[var(--color-text-muted-dark)] font-['Press_Start_2P'] text-center">
              {value.alt}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Fallback for other file types
  return (
    <div key={`media-${index}`} className="my-6 flex justify-center">
      <div className="relative border-2 border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-card-bg)] dark:bg-[var(--color-card-bg-dark)] p-4">
        <a
          href={value.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-['Press_Start_2P'] text-xs underline"
        >
          📎 {value.filename || 'Download File'}
        </a>
        {value.alt && (
          <div className="mt-2 text-xs text-[var(--color-text-muted)] dark:text-[var(--color-text-muted-dark)] font-['Press_Start_2P']">
            {value.alt}
          </div>
        )}
        <div className="mt-1 text-xs text-[var(--color-text-muted)] dark:text-[var(--color-text-muted-dark)] font-['Press_Start_2P']">
          {value.mimeType} • {formatFileSize(value.filesize)}
        </div>
      </div>
    </div>
  )
}

// Helper function to format file size
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'Unknown size'

  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`
}
