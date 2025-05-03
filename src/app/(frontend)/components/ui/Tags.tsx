import React from 'react'

const DEFAULT_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
]

interface TagProps {
  label: string
  type?: string
  className?: string
}

export const Tag: React.FC<TagProps> = ({ label, type = 'normal', className = '' }) => {
  // Ensure type is valid by defaulting to 'normal' if it's not in DEFAULT_TYPES
  const safeType = DEFAULT_TYPES.includes(type) ? type : 'normal'

  return (
    <span
      className={`
        font-['Press_Start_2P'] text-[0.8rem] px-2 py-0.5 
        border-2 border-[#080808] relative box-border 
        shadow-[inset_-2px_-2px_0_0_rgba(0,0,0,0.2)] select-none
        bg-pkm-${safeType}-bg text-pkm-${safeType}-text
        ${className}
      `}
    >
      {label}
    </span>
  )
}

interface TagsProps {
  tags: string[]
  typeCycle?: string[]
  className?: string
}

export const Tags: React.FC<TagsProps> = ({ tags, typeCycle = DEFAULT_TYPES, className = '' }) => (
  <div className={`flex flex-wrap gap-1 ${className}`}>
    {tags.map((tag, i) => {
      const type = typeCycle[i % typeCycle.length]
      return <Tag key={i} label={tag} type={type} />
    })}
  </div>
)

export default Tags
