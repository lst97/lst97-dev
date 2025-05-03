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

interface PkmStatusContainerProps {
  title: string
  direction: 'left' | 'right'
  currentHP?: number
  maxHP?: number
}

export function PkmStatusContainer({
  title,
  direction,
  currentHP,
  maxHP,
}: PkmStatusContainerProps) {
  const healthPercentage = maxHP ? (currentHP! / maxHP) * 100 : 100
  const healthColor =
    healthPercentage > 50 ? '#30da0c' : healthPercentage > 20 ? '#f7d02c' : '#ff0000'

  return (
    <div className="lg:m-4 m-2">
      <div
        className="relative bg-[#fffbeb] border-4 border-[#2c2c2c] px-4 py-2 inline-block min-w-52 shadow-inner"
        style={{ boxShadow: '4px 4px 0 0 #a8a8a8' }}
      >
        <span className="font-mono text-text uppercase tracking-wide">{title}</span>
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
        <PkmStatusContainer
          direction={direction}
          title={title}
          currentHP={currentHP}
          maxHP={maxHP}
        />
      </div>

      {direction === 'right' && <div className="m-8">{children}</div>}
    </div>
  )
}
