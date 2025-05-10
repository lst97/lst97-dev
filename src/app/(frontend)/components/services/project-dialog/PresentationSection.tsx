import React from 'react'
import { PixelVideoContainer } from '@/frontend/components/common/layout/Containers'

interface PresentationSectionProps {
  presentation: string
  videoId?: string
  youtubeUrl?: string
}

export const PresentationSection: React.FC<PresentationSectionProps> = ({
  presentation,
  videoId,
  youtubeUrl,
}) => {
  // Extract videoId from youtubeUrl if provided but no videoId
  const extractedVideoId = React.useMemo(() => {
    if (videoId) return videoId
    if (!youtubeUrl) return 'Du--gKWTiKc' // Default video ID

    // Extract from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/
    const match = youtubeUrl.match(regExp)
    return match && match[2].length === 11 ? match[2] : 'Du--gKWTiKc'
  }, [videoId, youtubeUrl])

  return (
    <div className="font-['Press_Start_2P'] p-8">
      <h3 className="text-3xl font-extrabold text-primary pb-8 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)]">
        PRESENTATION
      </h3>
      <p className="pb-8 text-md text-black/40">{presentation}</p>

      <div className="pt-4 pb-12 w-full">
        <PixelVideoContainer
          videoId={extractedVideoId}
          title="PROJECT DEMO"
          className="transform hover:scale-[1.01] transition-transform duration-300"
        />
      </div>
    </div>
  )
}
