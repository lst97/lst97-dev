import React from 'react'

interface StaticLoadingSpinnerProps {
  message?: string
}

export const StaticLoadingSpinner: React.FC<StaticLoadingSpinnerProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 image-rendering-pixelated">
      <div className="relative w-15 h-15">
        <div className="absolute top-0 w-full h-1/2 bg-red-600 rounded-t-full border-4 border-black border-b-2" />
        <div className="absolute bottom-0 w-full h-1/2 bg-gray-200 rounded-b-full border-4 border-black border-t-2" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-gray-200 border-4 border-black rounded-full z-10">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-pulse bg-red-600" />
        </div>
      </div>
      <p className="mt-4 font-['Press_Start_2P'] text-base text-gray-700 text-center">{message}</p>
    </div>
  )
}

interface StaticPageLoadingProps {
  message?: string
}

export const StaticPageLoading: React.FC<StaticPageLoadingProps> = ({
  message = 'Loading page...',
}) => {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <StaticLoadingSpinner message={message} />
    </div>
  )
}
