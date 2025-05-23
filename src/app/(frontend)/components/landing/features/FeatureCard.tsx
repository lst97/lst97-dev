import React from 'react'
import { motion, MotionProps } from 'framer-motion'
import { SiteFeature } from '../types'

interface FeatureCardProps {
  feature: SiteFeature
  onClick: (feature: SiteFeature) => void
  animation?: MotionProps
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onClick, animation }) => (
  <motion.div
    layout
    className={`cursor-pointer group bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] p-3 sm:p-4 rounded-none shadow-[6px_6px_0px_var(--shadow)] dark:shadow-[6px_6px_0px_var(--shadow-dark)] border-4 border-[var(--color-border)] dark:border-[var(--color-border-dark)] flex flex-col transition-all duration-200 hover:shadow-[2px_2px_0px_var(--shadow)] dark:hover:shadow-[2px_2px_0px_var(--shadow-dark)] hover:translate-x-[2px] hover:translate-y-[2px]`}
    onClick={() => onClick(feature)}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    {...animation}
  >
    <div className="flex items-center justify-center mb-3">
      <div
        className={`bg-gradient-to-br ${feature.color} p-2 rounded-full w-12 h-12 flex items-center justify-center border-2 border-[var(--color-border)] dark:border-[var(--color-border-dark)]`}
      >
        {feature.icon}
      </div>
    </div>
    <h3 className="font-pixel text-lg text-center mb-1 text-[var(--color-text)] dark:text-[var(--color-text-light)]">
      {feature.title}
    </h3>
    <p className="font-pixel text-xs text-center text-[var(--color-text)] dark:text-[var(--color-text-light)] opacity-90 line-clamp-2">
      {feature.description}
    </p>
  </motion.div>
)

export default FeatureCard
