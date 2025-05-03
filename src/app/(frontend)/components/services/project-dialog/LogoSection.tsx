import React from 'react'
import { AsciiTextGenerator } from '../../common/generators/Ascii'

interface LogoSectionProps {
  logoDescription: string
}

export const LogoSection: React.FC<LogoSectionProps> = ({ logoDescription }) => (
  <div className="font-['Press_Start_2P'] p-8">
    <h3 className="text-3xl font-extrabold text-primary pb-8 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)]">
      LOGO
    </h3>
    <div className="bg-secondary/50 border-8 border-double border-[#2c2c2c] rounded-[10px] pixel-border shadow-[8px_8px_0_0_#b58900] flex flex-col justify-center items-center p-12 w-full gap-8 mb-8">
      <AsciiTextGenerator text={'LST97'} />
    </div>
    <p className="pb-8 text-black/40 text-lg">{logoDescription}</p>
  </div>
)
