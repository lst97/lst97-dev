import React from 'react'
import { ProjectIdea } from '../types'

interface IdeasSectionProps {
  ideas: ProjectIdea[]
}

export const IdeasSection: React.FC<IdeasSectionProps> = ({ ideas }) => (
  <div
    className="font-['Press_Start_2P'] p-8 bg-yellow-200 border-8 border-[#2c2c2c] rounded-[10px] pixel-border shadow-[8px_8px_0_0_#b58900]"
    style={{
      backgroundImage: 'repeating-linear-gradient(135deg, #ffe580 0 8px, #fdf6e3 8px 16px)',
    }}
  >
    <div className="flex justify-center mb-4">
      <div className="backdrop-blur-sm bg-yellow-100/80 border-4 border-[#b58900] rounded-lg px-6 py-2 shadow-[0_2px_8px_rgba(181,137,0,0.15)] pixel-border-item">
        <h4 className="text-3xl text-primary drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)] text-center tracking-widest">
          KEY IDEAS
        </h4>
      </div>
    </div>
    <ul className="space-y-4 mt-6">
      {ideas.map((idea, index) => (
        <li
          key={index}
          className={`flex flex-col gap-1 px-6 py-4 rounded-lg border-4 border-black pixel-border-item ${
            index % 2 === 0 ? 'bg-yellow-50' : 'bg-yellow-100'
          } shadow-[4px_4px_0px_0px_#b58900] hover:scale-[1.02] transition-transform duration-150`}
          style={{
            boxShadow: '4px 4px 0 0 #b58900',
            borderRadius: '8px',
            borderImage: 'linear-gradient(90deg, #b58900 0%, #fffbeb 100%) 1',
          }}
        >
          <span className="flex items-center gap-2">
            <span className="text-2xl select-none" aria-hidden>
              ⭐
            </span>
            <span className="text-xl text-yellow-800 font-extrabold tracking-wide drop-shadow-[1px_1px_2px_rgba(0,0,0,0.12)]">
              {idea.title}
            </span>
          </span>
          <span className="text-base text-black/70 leading-snug pl-8 font-['Press_Start_2P']">
            {idea.content}
          </span>
        </li>
      ))}
    </ul>
  </div>
)
