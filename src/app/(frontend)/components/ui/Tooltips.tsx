import * as RadixTooltip from '@radix-ui/react-tooltip'
import React from 'react'

// Provider for wrapping the app or a subtree
export const TooltipProvider = RadixTooltip.Provider

// Tooltip component props
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
        className={`font-['Press_Start_2P']  border-4 border-[#2c2c2c] rounded-[10px] pixel-border z-50 px-4 py-3 text-xs text-text dark:text-text-light bg-secondary dark:bg-card-dark shadow-[8px_8px_0_0_#b58900] drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)] select-none image-pixelated ${className}`}
        style={{
          imageRendering: 'pixelated',
        }}
      >
        {content}
        <RadixTooltip.Arrow
          className="fill-secondary/50 dark:fill-card-dark stroke-border stroke-2"
          width={16}
          height={8}
          style={{ filter: 'drop-shadow(2px 2px 0 #b58900)' }}
        />
      </RadixTooltip.Content>
    </RadixTooltip.Portal>
  </RadixTooltip.Root>
)
