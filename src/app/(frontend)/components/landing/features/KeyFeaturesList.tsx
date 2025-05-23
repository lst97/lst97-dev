import React from 'react'
import { motion } from 'framer-motion'
import { SiteFeature } from '../types'
import ArrowRightIcon from '@heroicons/react/16/solid/ArrowRightIcon'
import WrenchIcon from '@heroicons/react/24/outline/WrenchIcon'
import CpuChipIcon from '@heroicons/react/24/outline/CpuChipIcon'
import CodeBracketIcon from '@heroicons/react/24/outline/CodeBracketIcon'
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon'

interface KeyFeaturesListProps {
  activeFeature: SiteFeature
}

export const KeyFeaturesList: React.FC<KeyFeaturesListProps> = ({ activeFeature }) => {
  let features: { icon: React.ReactNode; text: string }[] = []
  if (activeFeature.title === 'Services') {
    features = [
      {
        icon: <WrenchIcon className="w-8 h-8 md:w-12 md:h-12 text-yellow-500" />,
        text: 'Full-Stack Development',
      },
      {
        icon: <CpuChipIcon className="w-8 h-8 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-500" />,
        text: 'Cloud Infrastructure',
      },
      {
        icon: <DocumentTextIcon className="w-8 h-8 sm:w-6 sm:h-6 md:w-7 md:h-7 text-purple-500" />,
        text: 'UI/UX Design',
      },
      {
        icon: <ArrowRightIcon className="w-8 h-8 sm:w-6 sm:h-6 md:w-7 md:h-7 text-amber-500" />,
        text: 'Technical Consulting',
      },
    ]
  } else if (activeFeature.title === 'Projects') {
    features = [
      {
        icon: <CodeBracketIcon className="w-8 h-8 sm:w-6 sm:h-6 md:w-7 md:h-7 text-green-500" />,
        text: 'Web Applications',
      },
      {
        icon: <CpuChipIcon className="w-8 h-8 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-400" />,
        text: 'E-Commerce Sites',
      },
      {
        icon: <WrenchIcon className="w-8 h-8 sm:w-6 sm:h-6 md:w-7 md:h-7 text-yellow-500" />,
        text: 'Specialized Tools',
      },
      {
        icon: <ArrowRightIcon className="w-8 h-8 sm:w-6 sm:h-6 md:w-7 md:h-7 text-emerald-500" />,
        text: 'Case Studies',
      },
    ]
  } else if (activeFeature.title === 'Resources') {
    features = [
      {
        icon: <DocumentTextIcon className="w-8 h-8 sm:w-6 sm:h-6 md:w-7 md:h-7 text-purple-500" />,
        text: 'Technical Articles',
      },
      {
        icon: <ArrowRightIcon className="w-8 h-8 sm:w-6 sm:h-6 md:w-7 md:h-7 text-fuchsia-500" />,
        text: 'Tutorials',
      },
      {
        icon: <CodeBracketIcon className="w-8 h-8 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-500" />,
        text: 'Code Snippets',
      },
      {
        icon: <WrenchIcon className="w-8 h-8 sm:w-6 sm:h-6 md:w-7 md:h-7 text-yellow-500" />,
        text: 'Development Guides',
      },
    ]
  }
  return (
    <ul
      className="list-none font-pixel text-base sm:text-lg md:text-xl text-text 
        space-y-4 sm:space-y-6 md:space-y-0
        flex flex-col md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-6 lg:gap-x-12 lg:gap-y-8"
    >
      {features.map((f, i) => (
        <motion.li
          key={f.text}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
          className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5"
        >
          {f.icon}
          <span className="truncate md:whitespace-normal">{f.text}</span>
        </motion.li>
      ))}
    </ul>
  )
}

export default KeyFeaturesList
