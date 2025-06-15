'use client'

import React, { useState } from 'react'
import { PlainDialog } from '@/frontend/components/ui/Dialogs'

const VERSION = '0.1.0.alpha.1'

const CHANGELOG = [
  {
    version: VERSION,
    date: '2025-06-16',
    changes: [
      'Added alpha/transparency control for background colors',
      'Refactored background components for better maintainability',
      'Improved color preview with transparency support',
      'Added version tracking and changelog dialog',
      'Enhanced user interface with better component organization',
    ],
  },
]

export const VersionInfo: React.FC = () => {
  const [showChangelog, setShowChangelog] = useState(false)

  return (
    <>
      <div className="absolute bottom-4 right-4">
        <button
          onClick={() => setShowChangelog(true)}
          className="
            font-['Press_Start_2P'] text-[10px] text-text-color opacity-60 
            hover:opacity-100 transition-opacity cursor-pointer
            bg-card border border-border px-2 py-1 
            shadow-[1px_1px_0px_#000] hover:shadow-none 
            hover:translate-x-[1px] hover:translate-y-[1px]
          "
          title="View changelog"
        >
          v{VERSION}
        </button>
      </div>

      <PlainDialog
        open={showChangelog}
        onClose={() => setShowChangelog(false)}
        title="Background Remover Changelog"
      >
        <div className="max-h-96 overflow-y-auto">
          {CHANGELOG.map((release) => (
            <div key={release.version} className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="font-['Press_Start_2P'] text-sm text-accent-color">
                  v{release.version}
                </h3>
                <span className="font-['Press_Start_2P'] text-xs opacity-70">{release.date}</span>
              </div>
              <ul className="space-y-2">
                {release.changes.map((change, index) => (
                  <li
                    key={index}
                    className="font-['Press_Start_2P'] text-xs flex items-start gap-2"
                  >
                    <span className="text-accent-color mt-1">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </PlainDialog>
    </>
  )
}
