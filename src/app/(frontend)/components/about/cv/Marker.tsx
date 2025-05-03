import React from 'react'

interface MarkerProps {
  icon?: string
  isActive?: boolean
  className?: string
  variant?: 'section' | 'item'
}

export const Marker: React.FC<MarkerProps> = ({ icon, isActive, className, variant = 'item' }) => (
  <div
    className={`
			${
        variant === 'section'
          ? 'w-4 h-4 md:w-6 md:h-6 rounded-md border-none bg-[#ffe580] shadow-[0_2px_4px_#b58900]'
          : 'w-[20px] h-[20px] md:w-[26px] md:h-[26px] rounded-full bg-[#fff3c4] border-2 border-[#b58900]'
      }
			${isActive ? 'bg-[#b58900]' : ''}
			${className || ''}
			flex items-center justify-center absolute left-[-8px] md:left-[-12px] top-1/2 -translate-x-1/2 -translate-y-1/2 z-[2]
		`}
  >
    {icon ? (
      <span
        className={`${variant === 'section' ? 'text-xs md:text-base text-[#b58900]' : 'text-[10px] md:text-sm text-gray-500'}`}
      >
        {icon}
      </span>
    ) : (
      <div className="w-1 h-1 md:w-2 md:h-2 bg-[#fff3c4] rounded-full" />
    )}
  </div>
)
