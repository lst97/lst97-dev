import React from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
  className?: string
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  sideOffset = 8,
  className = '',
}) => (
  <RadixTooltip.Root delayDuration={0}>
    <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
    <RadixTooltip.Portal>
      <RadixTooltip.Content
        side={side}
        sideOffset={sideOffset}
        className={`font-['Press_Start_2P'] border-4 border-[#2c2c2c] rounded-[10px] pixel-border z-50 px-4 py-3 text-xs text-text dark:text-text-light bg-secondary select-none image-pixelated ${className}`}
        style={{
          imageRendering: 'pixelated',
        }}
      >
        <div className="w-full">{content}</div>
        <RadixTooltip.Arrow
          className="fill-secondary/50 dark:fill-card-dark stroke-border stroke-4"
          width={24}
          height={16}
        />
      </RadixTooltip.Content>
    </RadixTooltip.Portal>
  </RadixTooltip.Root>
)
