export function PixelContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative border-4 border-border bg-[#fffbeb] shadow-inner ${className || ''}`}
      style={{ boxShadow: '4px 4px 0 0 #a8a8a8' }}
    >
      {children}
    </div>
  )
}

// Video container with retro pixel art styling
export function PixelVideoContainer({
  videoId,
  title = 'Video Player',
  className,
}: {
  videoId: string
  title?: string
  className?: string
}) {
  return (
    <div className={`relative w-full max-w-5xl mx-auto ${className || ''}`}>
      {/* Outer container with pixel border */}
      <div
        className="border-8 border-border relative bg-[#2c2c2c] p-3 shadow-[8px_8px_0_0_#a8a8a8]"
        style={{
          borderImage:
            'repeating-linear-gradient(45deg, #2c2c2c 0, #2c2c2c 8px, #f9e796 8px, #f9e796 16px) 8',
        }}
      >
        {/* Top "screen" label */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#2c2c2c] px-4 py-1 z-10">
          <span className="font-['Press_Start_2P'] text-[#f9e796] text-xs uppercase">{title}</span>
        </div>

        {/* Video container */}
        <div className="relative aspect-video w-full overflow-hidden">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#f9e796] z-10"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#f9e796] z-10"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#f9e796] z-10"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#f9e796] z-10"></div>

          {/* YouTube iframe */}
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  )
}

interface PkmStatusContainerProps {
  title: string
  currentHP?: number
  maxHP?: number
}

export function PkmStatusContainer({ title, currentHP, maxHP }: PkmStatusContainerProps) {
  const healthPercentage = maxHP ? (currentHP! / maxHP) * 100 : 100
  const healthColor =
    healthPercentage > 50 ? '#30da0c' : healthPercentage > 20 ? '#f7d02c' : '#ff0000'

  return (
    <div className="lg:m-4 m-2">
      <div
        className="relative bg-card border-4 border-[#2c2c2c] px-4 py-2 inline-block min-w-52 shadow-inner"
        style={{ boxShadow: '4px 4px 0 0 #a8a8a8' }}
      >
        <span className="font-['Press_Start_2P'] text-text uppercase tracking-wide">{title}</span>
        {currentHP !== undefined && maxHP !== undefined && (
          <div
            className="h-2 mt-2 border-2 border-[#2c2c2c] relative"
            style={{ background: healthColor, width: `${healthPercentage}%` }}
          ></div>
        )}
      </div>
    </div>
  )
}

export function PkmBattleLayout({
  children,
  direction,
  title,
  currentHP,
  maxHP,
}: {
  children: React.ReactNode
  direction: 'left' | 'right'
  title: string
  currentHP?: number
  maxHP?: number
}) {
  return (
    <div
      className={`flex lg:flex-row ${
        direction === 'left' ? 'flex-col-reverse' : 'flex-col'
      } items-center`}
    >
      {direction === 'left' && <div className="m-8">{children}</div>}

      <div className="lg:basis-1/2">
        <PkmStatusContainer title={title} currentHP={currentHP} maxHP={maxHP} />
      </div>

      {direction === 'right' && <div className="m-8">{children}</div>}
    </div>
  )
}
