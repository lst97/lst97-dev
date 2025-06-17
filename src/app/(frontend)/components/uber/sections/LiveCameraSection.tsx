import React from 'react'
import { FaVideo, FaPlay, FaTwitch, FaYoutube } from 'react-icons/fa'

/**
 * Props for the LiveCameraSection component.
 */
interface LiveCameraSectionProps {
  /** The streaming platform URL or embed code */
  streamUrl?: string
  /** Whether the stream is currently live */
  isLive?: boolean
  /** The streaming platform type */
  platform?: 'twitch' | 'youtube' | 'custom'
}

/**
 * Section component for displaying live camera/streaming feed.
 * @param {LiveCameraSectionProps} props - The props for the component.
 */
const LiveCameraSection: React.FC<LiveCameraSectionProps> = ({
  streamUrl,
  isLive = false,
  platform = 'twitch',
}: LiveCameraSectionProps) => {
  const getPlatformIcon = () => {
    switch (platform) {
      case 'twitch':
        return <FaTwitch className="text-purple-500 text-2xl" />
      case 'youtube':
        return <FaYoutube className="text-red-500 text-2xl" />
      default:
        return <FaVideo className="text-accent-color text-2xl" />
    }
  }

  const getPlatformName = () => {
    switch (platform) {
      case 'twitch':
        return 'Twitch'
      case 'youtube':
        return 'YouTube Live'
      default:
        return 'Live Stream'
    }
  }

  return (
    <section className="mb-16" id="live-camera">
      <h2 className="leading-16 font-['Press_Start_2P'] text-[3rem] text-text-color drop-shadow-[3px_3px_0_var(--text-shadow-color)] mb-12 text-center relative after:content-[''] after:absolute after:bottom-[-1rem] after:left-1/2 after:-translate-x-1/2 after:w-[100px] after:h-1 after:bg-[repeating-linear-gradient(45deg,var(--border-color)_0,var(--border-color)_4px,transparent_4px,transparent_8px)]">
        Live Camera Feed
      </h2>

      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <p className="font-pixel text-lg text-text-color leading-relaxed max-w-4xl mx-auto">
            Watch me in action during live deliveries! See the approach I take with every order.
          </p>
        </div>

        {/* Live Status Indicator */}
        <div className="flex justify-center mb-8">
          <div
            className={`flex items-center gap-3 px-6 py-3 border-4 border-border shadow-[4px_4px_0_var(--shadow-color)] ${
              isLive ? 'bg-green-100 border-green-500' : 'bg-gray-100 border-gray-500'
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full ${
                isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            <span className="font-['Press_Start_2P'] text-sm text-text-color">
              {isLive ? 'LIVE NOW' : 'OFFLINE'}
            </span>
            {getPlatformIcon()}
            <span className="font-pixel text-sm text-text-color">{getPlatformName()}</span>
          </div>
        </div>

        {/* Stream Container */}
        <div className="border-4 border-border p-4 bg-card-background shadow-[8px_8px_0_var(--shadow-color)] relative before:content-[''] before:absolute before:inset-0 before:border-2 before:border-border before:pointer-events-none after:content-[''] after:absolute after:inset-0 after:bg-dots after:opacity-5 after:pointer-events-none">
          {streamUrl ? (
            <div className="aspect-video w-full bg-black border-2 border-border relative overflow-hidden">
              {/* Twitch Embed */}
              {platform === 'twitch' && (
                <iframe
                  src={streamUrl}
                  height="100%"
                  width="100%"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  title="Twitch Live Stream"
                />
              )}

              {/* YouTube Embed */}
              {platform === 'youtube' && (
                <iframe
                  src={streamUrl}
                  height="100%"
                  width="100%"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  title="YouTube Live Stream"
                />
              )}

              {/* Custom Embed */}
              {platform === 'custom' && (
                <iframe
                  src={streamUrl}
                  height="100%"
                  width="100%"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  title="Live Stream"
                />
              )}
            </div>
          ) : (
            /* Placeholder when no stream URL */
            <div className="aspect-video w-full bg-gray-800 border-2 border-border flex flex-col items-center justify-center text-center p-8">
              <FaVideo className="text-6xl text-gray-400 mb-4" />
              <h3 className="font-['Press_Start_2P'] text-xl text-gray-300 mb-4">
                Stream Coming Soon
              </h3>
              <p className="font-pixel text-md text-gray-400 leading-relaxed max-w-md">
                I&apos;m setting up live streaming capabilities to show you delivery process in
                real-time.
              </p>
              <div className="mt-6 flex gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-600 border-2 border-border">
                  <FaTwitch className="text-white" />
                  <span className="font-pixel text-sm text-white">Twitch Ready</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-600 border-2 border-border">
                  <FaYoutube className="text-white" />
                  <span className="font-pixel text-sm text-white">YouTube Ready</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stream Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-4 border-border p-6 bg-amber-50 shadow-[4px_4px_0_var(--shadow-color)]">
            <h4 className="font-['Press_Start_2P'] text-lg text-text-color mb-4 flex items-center gap-2">
              <FaPlay className="text-accent-color" />
              What You&apos;ll See
            </h4>
            <ul className="font-pixel text-sm text-text-color space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-accent-color">→</span>
                Gear setup and usage
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-color">→</span>
                Careful food handling and transport
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-color">→</span>
                Navigation and delivery process
              </li>
            </ul>
          </div>

          <div className="border-4 border-border p-6 bg-amber-50 shadow-[4px_4px_0_var(--shadow-color)]">
            <h4 className="font-['Press_Start_2P'] text-lg text-text-color mb-4 flex items-center gap-2">
              <FaVideo className="text-accent-color" />
              Stream Schedule
            </h4>
            <div className="font-pixel text-sm text-text-color space-y-2">
              <p>
                <strong>Dinner Rush:</strong> 5:30 PM - 9:00 PM
              </p>
              <p className="text-xs opacity-70 mt-4">
                * Schedule may vary based on demand and weather conditions
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 border-4 border-border p-6 bg-amber-100 shadow-[4px_4px_0_var(--shadow-color)] text-center">
          <h4 className="font-['Press_Start_2P'] text-md text-text-color mb-3">
            🔒 Privacy & Safety
          </h4>
          <p className="font-pixel text-sm text-text-color leading-relaxed">
            All streams respect customer privacy. No personal information, addresses, or customer
            faces are shown. The focus is purely on demonstrating delivery process, techniques and
            equipment usage.
          </p>
        </div>
      </div>
    </section>
  )
}

export default LiveCameraSection
