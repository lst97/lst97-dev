'use client'

import React, { useRef, useState } from 'react'
import type { ExtendedGameControlsProps, Priority } from '../../types'
import { FaUpload, FaPlay, FaPause, FaStop, FaRedo, FaDownload, FaFileImport } from 'react-icons/fa'
import { MdAnalytics, MdCloud, MdCloudOff, MdSecurity } from 'react-icons/md'
import { PixelCheckbox } from '@/app/(frontend)/components/ui'
import Turnstile from '@/app/(frontend)/components/security/Turnstile'

export default function GameControls({
  onFileUpload,
  onRegenerateKeystrokeMap,
  onStartGame,
  onPauseGame,
  onResumeGame,
  onStopGame,
  isAnalyzing,
  hasKeystrokeMap,
  canPlay,
  gameState,
  uploadedFileName,
  onExportMap,
  onImportMap,
  cloudProcessingEnabled,
  onCloudProcessingToggle,
  mapFileName,
  isAudioLoadedForPreAnalyzed,
  isDemoLoading = false,
  priority = 'normal',
  onPriorityChange,
}: ExtendedGameControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mapImportInputRef = useRef<HTMLInputElement>(null)
  const [turnstileToken, setTurnstileToken] = useState<string>('')
  const [showTurnstile, setShowTurnstile] = useState(false)
  const [showVerificationText, setShowVerificationText] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileUpload(file, turnstileToken)
      // Clean up turnstile token after upload to require re-verification for next upload
      setTurnstileToken('')
      setShowVerificationText(false)
    }
  }

  const handleFileClick = () => {
    if (cloudProcessingEnabled && !turnstileToken) {
      setShowTurnstile(true)
      return
    }
    fileInputRef.current?.click()
  }

  const handleTurnstileVerify = (token: string) => {
    setTurnstileToken(token)
    setShowTurnstile(false)
    setShowVerificationText(true)
    
    // Hide verification text after 3 seconds
    setTimeout(() => {
      setShowVerificationText(false)
    }, 3000)
    
    // Automatically trigger file upload after verification
    setTimeout(() => {
      fileInputRef.current?.click()
    }, 100)
  }

  const handleTurnstileExpired = () => {
    setTurnstileToken('')
    setShowTurnstile(false)
    setShowVerificationText(false)
  }

  const handleMapImportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImportMap(file)
    }
  }

  const handleMapImportClick = () => {
    mapImportInputRef.current?.click()
  }

  // Reset turnstile token when cloud processing is disabled
  React.useEffect(() => {
    if (!cloudProcessingEnabled) {
      setTurnstileToken('')
      setShowTurnstile(false)
      setShowVerificationText(false)
    }
  }, [cloudProcessingEnabled])

  return (
    <div className="bg-card border-2 border-border shadow-[4px_4px_0px_#000] pixel-border p-6">
      <div className="flex flex-col items-center gap-4">
        {/* Cloud Processing Toggle */}
        <div className="flex items-center gap-4 p-4 bg-hover border-2 border-border rounded">
          <PixelCheckbox
            checked={cloudProcessingEnabled}
            onCheckedChange={onCloudProcessingToggle}
            label="Cloud Processing"
            disabled={isAnalyzing || isDemoLoading}
          />
          <div className="flex items-center gap-2 text-sm text-text font-['Press_Start_2P']">
            {cloudProcessingEnabled ? (
              <>
                <MdCloud className="text-accent" />
                <span>Server Analysis</span>
              </>
            ) : (
              <>
                <MdCloudOff className="text-warning" />
                <span>Pre-analyzed Map</span>
              </>
            )}
          </div>
        </div>


        {/* Priority Selector - Only show when cloud processing is enabled */}
        {cloudProcessingEnabled && (
          <div className="flex items-center gap-4 p-4 bg-hover border-2 border-border rounded">
            <label className="text-sm text-text font-['Press_Start_2P']">
              Priority:
            </label>
            <select
              value={priority}
              onChange={(e) => onPriorityChange?.(e.target.value as Priority)}
              disabled={isAnalyzing || isDemoLoading}
              className="bg-card border-2 border-border text-sm text-text font-['Press_Start_2P'] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
            >
              <option value="batch">Batch (slower)</option>
              <option value="normal">Normal</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        )}

        {/* Control Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* Audio File Upload - Always available */}
          <div className="flex flex-col items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isAnalyzing}
            />
            <button
              onClick={handleFileClick}
              disabled={isAnalyzing || isDemoLoading}
              className={`
                bg-primary text-white font-['Press_Start_2P'] text-sm border-2 border-primary 
                px-6 py-3 shadow-[4px_4px_0px_#000] pixel-border cursor-pointer
                flex items-center gap-2 min-w-[200px] justify-center
                ${
                  isAnalyzing || isDemoLoading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200'
                }
              `}
            >
              {isAnalyzing || isDemoLoading ? (
                <>
                  <MdAnalytics className="animate-spin" />
                  {isDemoLoading ? 'LOADING DEMO...' : cloudProcessingEnabled ? 'ANALYZING...' : 'LOADING...'}
                </>
              ) : cloudProcessingEnabled && !turnstileToken ? (
                <>
                  <MdSecurity />
                  VERIFY TO UPLOAD
                </>
              ) : (
                <>
                  <FaUpload />
                  CHOOSE AUDIO FILE
                </>
              )}
            </button>
            
            {/* Turnstile component shown under analyze button when cloud processing is enabled */}
            {cloudProcessingEnabled && showTurnstile && (
              <div className="w-full mt-4">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                  onVerify={handleTurnstileVerify}
                  onExpired={handleTurnstileExpired}
                  action="typo-sync-analysis"
                />
              </div>
            )}
            
            {/* Verification status shown under analyze button */}
            {cloudProcessingEnabled && turnstileToken && showVerificationText && (
              <div className="flex items-center gap-2 text-xs text-accent font-['Press_Start_2P'] mt-2">
                <MdSecurity />
                <span>Verified ✓</span>
              </div>
            )}
          </div>

          {/* Local Processing Mode: Map Import */}
          {!cloudProcessingEnabled && (
            <div className="flex flex-col items-center gap-2">
              <input
                ref={mapImportInputRef}
                type="file"
                accept=".json"
                onChange={handleMapImportChange}
                className="hidden"
                disabled={isAnalyzing || isDemoLoading || !isAudioLoadedForPreAnalyzed}
              />
              <button
                onClick={handleMapImportClick}
                disabled={isAnalyzing || isDemoLoading || !isAudioLoadedForPreAnalyzed}
                title={
                  isAnalyzing || isDemoLoading
                    ? 'Please wait while loading...'
                    : !isAudioLoadedForPreAnalyzed
                    ? 'Please load an audio file first'
                    : 'Import pre-analyzed map'
                }
                className={`
                  bg-accent text-white font-['Press_Start_2P'] text-sm border-2 border-accent 
                  px-6 py-3 shadow-[4px_4px_0px_#000] pixel-border cursor-pointer
                  flex items-center gap-2 min-w-[200px] justify-center
                  ${
                    isAnalyzing || isDemoLoading || !isAudioLoadedForPreAnalyzed
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200'
                  }
                `}
              >
                <FaFileImport />
                IMPORT MAP
              </button>
            </div>
          )}

          {/* Control Buttons - Show after keystroke map is generated */}
          {hasKeystrokeMap && (
            <>
              {/* Export Map Button */}
              <button
                onClick={onExportMap}
                disabled={isAnalyzing || isDemoLoading}
                className="bg-secondary text-white font-['Press_Start_2P'] text-sm border-2 border-secondary p-3 shadow-[4px_4px_0px_#000] pixel-border hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-12 h-12"
                title="Export game map"
              >
                <FaDownload />
              </button>

              {/* Regenerate Map Button */}
              <button
                onClick={onRegenerateKeystrokeMap}
                disabled={isAnalyzing || isDemoLoading}
                className="bg-secondary text-white font-['Press_Start_2P'] text-sm border-2 border-secondary p-3 shadow-[4px_4px_0px_#000] pixel-border hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-12 h-12"
                title="Regenerate keystroke map"
              >
                <FaRedo />
              </button>

              {/* Play/Pause/Stop Buttons */}
              {gameState.isActive ? (
                <div className="flex gap-2">
                  {/* Pause/Resume Button */}
                  <button
                    onClick={gameState.isPaused ? onResumeGame : onPauseGame}
                    className="bg-warning text-white font-['Press_Start_2P'] text-sm border-2 border-warning p-3 shadow-[4px_4px_0px_#000] pixel-border hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 flex items-center justify-center w-12 h-12"
                    title={gameState.isPaused ? 'Resume game' : 'Pause game'}
                  >
                    {gameState.isPaused ? <FaPlay /> : <FaPause />}
                  </button>

                  {/* Stop Button */}
                  <button
                    onClick={onStopGame}
                    className="bg-error text-white font-['Press_Start_2P'] text-sm border-2 border-error p-3 shadow-[4px_4px_0px_#000] pixel-border hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 flex items-center justify-center w-12 h-12"
                    title="Stop game"
                  >
                    <FaStop />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onStartGame}
                  disabled={!canPlay || isDemoLoading}
                  className="bg-accent text-white font-['Press_Start_2P'] text-sm border-2 border-accent p-3 shadow-[4px_4px_0px_#000] pixel-border hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-12 h-12"
                  title={isDemoLoading ? "Please wait while demo loads..." : "Start game"}
                >
                  <FaPlay />
                </button>
              )}
            </>
          )}
        </div>

        {/* File Name Display */}
        {(uploadedFileName || mapFileName) && (
          <div className="text-xs text-text opacity-70 font-['Press_Start_2P'] mt-2 text-center">
            {uploadedFileName && <p>Audio: {uploadedFileName}</p>}
            {mapFileName && <p>Map: {mapFileName}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
