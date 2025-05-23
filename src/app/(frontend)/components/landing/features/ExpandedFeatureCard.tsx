import React from 'react'
import { motion } from 'framer-motion'
import YouTube, { YouTubeProps } from 'react-youtube'
import { NavigationLink } from '@/frontend/components/ui/Links'
import { SiteFeature } from '../types'
import ArrowRightIcon from '@heroicons/react/16/solid/ArrowRightIcon'
import { KeyFeaturesList } from './KeyFeaturesList'

interface ExpandedFeatureCardProps {
  activeFeature: SiteFeature
  youtubeOpts: YouTubeProps['opts']
}

export const ExpandedFeatureCard: React.FC<ExpandedFeatureCardProps> = ({
  activeFeature,
  youtubeOpts,
}) => (
  <motion.div
    key={`expanded-${activeFeature.id}`}
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ type: 'tween', duration: 0.4 }}
    className="w-full"
  >
    <div
      className=" min-h-[640px] sm:min-h-[520px] md:min-h-[600px] relative rounded-none shadow-[10px_10px_0px_var(--shadow)] border-4 overflow-hidden bg-card border-border h-[520px] sm:h-[600px] md:h-auto md:aspect-[16/9]"
      style={{
        backgroundImage:
          activeFeature.id !== 'tools'
            ? `url('/${
                activeFeature.id === 'projects'
                  ? 'project-pixel-art.png'
                  : activeFeature.id === 'services'
                    ? 'service-pixel-art.png'
                    : 'blog-post-pixel-art.png'
              }')`
            : undefined,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'bottom right',
        backgroundSize: '40vw',
        // The image will be faded using a semi-transparent overlay below
      }}
    >
      {/* Overlay for background image opacity */}
      {activeFeature.id !== 'tools' && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'rgba(255,255,255,0.9)' }}
        />
      )}
      {/* Only show YouTube for Tools */}
      {activeFeature.id === 'tools' && (
        <div className="absolute inset-0 overflow-hidden">
          <YouTube
            videoId={activeFeature.youtubeId}
            opts={youtubeOpts}
            className="w-full h-full pointer-events-none"
            iframeClassName="w-full h-full absolute top-0 left-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-card)] dark:from-[var(--color-card-dark)] opacity-70"></div>
        </div>
      )}
      <div className="relative z-10 h-full flex flex-col justify-between bg-amber-100/30">
        {/* Title container with transparent background */}
        <div className="mb-6">
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center ml-0 sm:ml-1 mr-0 sm:mr-[2px] bg-gradient-to-t from-bg-card/80 to-amber-100/20 backdrop-blur-md px-4 sm:px-8 pt-4 sm:pt-8 overflow-hidden gap-2 sm:gap-0">
            {/* Gradient blur overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 backdrop-blur-[2px] bg-gradient-to-t from-transparent via-transparent to-white/10 dark:to-black/10"></div>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 100%)',
                  backdropFilter: 'blur(0px)',
                  WebkitMask: 'linear-gradient(to top, black 0%, transparent 100%)',
                  mask: 'linear-gradient(to top, black 0%, transparent 100%)',
                }}
              ></div>
            </div>
            <div
              className={`bg-gradient-to-br ${activeFeature.color} p-3 rounded-full w-16 h-16 flex items-center justify-center border-2 border-border flex-shrink-0 relative z-10`}
            >
              {activeFeature.icon}
            </div>
            <div className="ml-0 sm:ml-4 mt-2 sm:mt-0 relative z-10">
              <h2 className="font-pixel text-xl sm:text-2xl md:text-3xl text-[var(--color-text)] dark:text-[var(--color-text-light)]">
                {activeFeature.title}
              </h2>
              <p className="font-pixel text-xs sm:text-sm md:text-base text-[var(--color-text)] dark:text-[var(--color-text-light)] opacity-90">
                {activeFeature.description}
              </p>
            </div>
          </div>
        </div>
        {/* Simplified layout for tools, normal layout for others */}
        {activeFeature.id === 'tools' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mt-auto flex justify-center sm:justify-end"
          >
            <NavigationLink
              href={activeFeature.link}
              className="font-pixel text-sm inline-flex items-center bg-[var(--color-primary)] text-[var(--color-button-text)] px-5 py-3 rounded-none border-2 border-[var(--color-border)] dark:border-[var(--color-border-dark)] hover:bg-opacity-90 transition-all shadow-[4px_4px_0px_var(--shadow)] hover:shadow-[1px_1px_0px_var(--shadow)] hover:translate-x-[2px] hover:translate-y-[2px] w-full sm:w-auto text-center justify-center"
            >
              Explore {activeFeature.title} <ArrowRightIcon className="w-4 h-4 ml-2" />
            </NavigationLink>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {/* Key Features with icons and animation */}
              <div className="relative pl-8 sm:px-4 md:px-12 lg:px-16 pb-4 sm:pb-8 pt-2 sm:pt-8">
                <h3 className="font-pixel text-lg sm:text-xl md:text-2xl text-text flex items-center gap-2 sm:gap-4 mb-8 sm:mb-4 md:mb-8">
                  <ArrowRightIcon className="w-12 h-12 sm:w-8 sm:h-8 md:w-12 md:h-12 text-accent" />
                  Key {activeFeature.title}
                </h3>
                <KeyFeaturesList activeFeature={activeFeature} />
                {/* Pixel art project icon decoration */}
                {/* Decoration image moved to background */}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex justify-center sm:justify-end"
            >
              <NavigationLink
                href={activeFeature.link}
                className="font-pixel text-sm inline-flex items-center bg-[var(--color-primary)] text-[var(--color-button-text)] px-5 py-3 rounded-none border-2 border-[var(--color-border)] dark:border-[var(--color-border-dark)] hover:bg-opacity-90 transition-all shadow-[4px_4px_0px_var(--shadow)] hover:shadow-[1px_1px_0px_var(--shadow)] hover:translate-x-[2px] hover:translate-y-[2px] w-full sm:w-auto text-center justify-center"
              >
                Explore {activeFeature.title} <ArrowRightIcon className="w-4 h-4 ml-2" />
              </NavigationLink>
            </motion.div>
          </>
        )}
      </div>
    </div>
  </motion.div>
)

export default ExpandedFeatureCard
