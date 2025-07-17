
'use client'

import React from 'react'

interface NotificationOverlayProps {
  error: string | null
  validationWarnings: string[]
  showWarnings: boolean
  onCloseWarnings: () => void
  onDismissWarnings: () => void
}

const NotificationOverlay: React.FC<NotificationOverlayProps> = ({
  error,
  validationWarnings,
  showWarnings,
  onCloseWarnings,
  onDismissWarnings,
}) => {
  return (
    <>
      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-md z-50">
          <div
            className="bg-red-100 border-4 border-red-700 text-black p-4 shadow-[8px_8px_0px_#000] pixel-border"
            style={{
              imageRendering: 'pixelated',
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl filter drop-shadow(2px 2px 0 #000)">⚠️</span>
              <div>
                <h4 className="text-sm mb-2 text-red-800" style={{ textShadow: '1px 1px 0 #fff' }}>
                  ERROR
                </h4>
                <p className="text-xs mb-3 leading-relaxed text-gray-800" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white px-3 py-1 text-xs border-2 border-red-800 hover:bg-red-700 transition-all duration-200 pixel-border"
                >
                  RELOAD
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Display */}
      {showWarnings && validationWarnings.length > 0 && (
        <div className="fixed bottom-4 left-4 max-w-lg z-50">
          <div
            className="bg-amber-100 border-4 border-amber-500 text-black p-4 shadow-[8px_8px_0px_#000] pixel-border"
            style={{
              imageRendering: 'pixelated',
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl filter drop-shadow(2px 2px 0 #000)">⚠️</span>
              <div className="flex-1">
                <h4
                  className="text-sm mb-2 text-amber-800"
                  style={{ textShadow: '1px 1px 0 #fff' }}
                >
                  IMPORT WARNINGS
                </h4>
                <div className="space-y-2 mb-3">
                  {validationWarnings.map((warning, index) => (
                    <p key={index} className="text-xs leading-relaxed text-gray-800" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                      {warning}
                    </p>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onCloseWarnings}
                    className="bg-amber-500 text-white px-3 py-1 text-xs border-2 border-amber-700 hover:bg-amber-600 transition-all duration-200 pixel-border"
                  >
                    ✓ OK
                  </button>
                  <button
                    onClick={onDismissWarnings}
                    className="bg-gray-600 text-white px-3 py-1 text-xs border-2 border-gray-800 hover:bg-gray-700 transition-all duration-200 pixel-border"
                  >
                    ✗ DISMISS
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default NotificationOverlay
