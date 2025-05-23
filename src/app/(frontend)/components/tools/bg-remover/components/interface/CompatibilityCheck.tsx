import React from 'react'
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa'
import { Tooltip } from '@/frontend/components/ui/Tooltips'

type CompatibilityCheckProps = {
  webGLSupported: boolean
  webGPUSupported: boolean
}

/**
 * CompatibilityCheck component displays browser and feature compatibility information
 * with a simplified grouped indicator and detailed tooltips.
 */
export const CompatibilityCheck: React.FC<CompatibilityCheckProps> = ({
  webGLSupported,
  webGPUSupported,
}) => {
  // Determine if all essential features are supported
  const allEssentialSupported = webGLSupported

  const statusContent = (
    <>{allEssentialSupported ? 'Essential features supported' : 'Missing required features'}</>
  )

  const infoContent = (
    <div className="w-full">
      <p className="mb-2 font-bold">Feature Requirements:</p>
      <table className="w-full border-collapse mb-3">
        <tbody>
          <tr>
            <td className="whitespace-nowrap pr-2 align-top">WebGL:</td>
            <td className={webGLSupported ? 'text-success align-top' : 'text-error align-top'}>
              {webGLSupported ? 'Supported (Required)' : 'Not Supported (Required)'}
            </td>
          </tr>
          <tr>
            <td className="whitespace-nowrap pr-2 align-top">WebGPU:</td>
            <td className={webGPUSupported ? 'text-success align-top' : 'text-warning align-top'}>
              {webGPUSupported ? 'Supported (Recommended)' : 'Not Supported (Recommended)'}
            </td>
          </tr>
        </tbody>
      </table>

      <p className="mb-2 font-bold">Browser Compatibility:</p>
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className="whitespace-nowrap pr-2 align-top">Chrome:</td>
            <td className="text-success align-top">Optimized</td>
          </tr>
          <tr>
            <td className="whitespace-nowrap pr-2 align-top">Firefox:</td>
            <td className="text-warning align-top">Degraded</td>
          </tr>
          <tr>
            <td className="whitespace-nowrap pr-2 align-top">Safari:</td>
            <td className="text-error align-top">May not work</td>
          </tr>
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="flex gap-4 items-center font-['Press_Start_2P'] text-[10px]">
      {/* Overall Compatibility Status */}
      <div className="flex flex-col items-center">
        <div className="font-bold mb-1">Status</div>
        <Tooltip content={statusContent} side="left" className="image-pixelated">
          <div className="flex items-center h-5 cursor-help bg-transparent">
            {allEssentialSupported ? (
              <FaCheckCircle className="text-success h-5 w-5" />
            ) : (
              <FaExclamationTriangle className="text-error h-5 w-5" />
            )}
          </div>
        </Tooltip>
      </div>

      {/* Info Icon with detailed tooltip */}
      <div className="flex flex-col items-center">
        <div className="font-bold mb-1">Info</div>
        <Tooltip content={infoContent} side="left" sideOffset={5} className="image-pixelated w-96">
          <div className="flex items-center h-5 cursor-help bg-transparent">
            <FaInfoCircle className="text-info h-5 w-5" />
          </div>
        </Tooltip>
      </div>
    </div>
  )
}
