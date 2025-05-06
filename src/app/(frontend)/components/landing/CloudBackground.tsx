'use client'

import React from 'react'
import '@/frontend/styles/clouds.css'
import Image from 'next/image'

interface CloudProps {
  className?: string
}

const CloudBackground: React.FC<CloudProps> = ({ className = '' }) => {
  return (
    <div
      className={`absolute top-0 left-0 w-full h-2/5 overflow-hidden z-10 pointer-events-none ${className}`}
    >
      <div className="relative w-full h-full">
        <Image
          src="/cloud-1-pixel-art.png"
          alt="Cloud 1"
          width={200}
          height={100}
          className="absolute top-[10%] left-0 w-[200px] h-[100px] animate-[floatCloud1_60s_linear_infinite]"
          style={{ animationDelay: '0s' }}
        />
        <Image
          src="/cloud-2-pixel-art.png"
          alt="Cloud 2"
          width={180}
          height={90}
          className="absolute top-[25%] left-0 w-[180px] h-[90px] animate-[floatCloud2_75s_linear_infinite]"
          style={{ animationDelay: '-15s' }}
        />
        <Image
          src="/cloud-3-pixel-art.png"
          alt="Cloud 3"
          width={160}
          height={80}
          className="absolute top-[5%] left-0 w-[160px] h-[80px] animate-[floatCloud3_65s_linear_infinite]"
          style={{ animationDelay: '-30s' }}
        />
        <Image
          src="/cloud-4-pixel-art.png"
          alt="Cloud 4"
          width={190}
          height={95}
          className="absolute top-[18%] left-0 w-[190px] h-[95px] animate-[floatCloud4_80s_linear_infinite]"
          style={{ animationDelay: '-45s' }}
        />
        {/* Additional clouds with different starting positions */}
        <Image
          src="/cloud-1-pixel-art.png"
          alt="Cloud 5"
          width={200}
          height={100}
          className="absolute top-[15%] left-0 w-[180px] h-[90px] animate-[floatCloud1_70s_linear_infinite]"
          style={{ animationDelay: '-20s' }}
        />
        <Image
          src="/cloud-3-pixel-art.png"
          alt="Cloud 6"
          width={160}
          height={80}
          className="absolute top-[30%] left-0 w-[150px] h-[75px] animate-[floatCloud3_55s_linear_infinite]"
          style={{ animationDelay: '-40s' }}
        />
      </div>
    </div>
  )
}

CloudBackground.displayName = 'CloudBackground'
export default CloudBackground
