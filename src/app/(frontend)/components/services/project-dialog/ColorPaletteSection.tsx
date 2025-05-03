import React from 'react'
import { Tooltip } from '@/frontend/components/ui/Tooltips'

interface ColorPaletteSectionProps {
  lightTheme: string[]
}

export const ColorPaletteSection: React.FC<ColorPaletteSectionProps> = ({ lightTheme }) => (
  <div className="font-['Press_Start_2P'] p-8 sm:p-6 xs:p-3">
    <h3 className="text-3xl font-extrabold text-primary pb-8 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)]">
      COLOR PALETTE
    </h3>
    <div className="bg-secondary/50 border-8 border-double border-[#2c2c2c] rounded-[10px] pixel-border shadow-[8px_8px_0_0_#b58900] flex flex-col justify-center items-center p-8 sm:p-4 xs:p-2 w-full gap-8 sm:gap-4 xs:gap-2 mb-8">
      <div className="flex flex-row flex-wrap justify-center items-center w-full gap-8 sm:gap-4 xs:gap-2 p-4 xs:p-1">
        {lightTheme.map((color, index) => (
          <Tooltip key={index} content={color} side="top" sideOffset={8}>
            <div
              className="rounded-md w-28 h-28 sm:w-20 sm:h-20 xs:w-14 xs:h-14 border-4 border-black shadow-[2px_2px_0px_0px_#b58900] cursor-pointer"
              style={{ backgroundColor: color }}
            ></div>
          </Tooltip>
        ))}
      </div>
    </div>
  </div>
)
