'use client'
import { format, parseISO } from 'date-fns'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'
import { Tag } from '@/frontend/components/ui/Tags'

export type NoteCategory = {
  name: string
  type:
    | 'normal'
    | 'fire'
    | 'water'
    | 'electric'
    | 'grass'
    | 'ice'
    | 'fighting'
    | 'poison'
    | 'ground'
    | 'flying'
    | 'psychic'
    | 'bug'
    | 'rock'
    | 'ghost'
    | 'dragon'
    | 'dark'
    | 'steel'
    | 'fairy'
}

export type NoteStats = {
  readingTime?: number
  views?: number
  likes?: number
}

export function NoteItem({
  title,
  date,
  href,
  categories,
  description,
  icon,
  iconAlt,
  stats,
}: Readonly<{
  title: string
  date: string
  href?: string
  categories?: NoteCategory[]
  description?: string
  icon?: string
  iconAlt?: string
  stats?: NoteStats
}>) {
  const router = useRouter()
  const formattedDate = format(parseISO(date), 'dd MMM yyyy')
  return (
    <div
      className="group relative grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto] gap-2 md:gap-4 p-3 pl-6 bg-background pixel-border cursor-pointer transition-transform duration-100 text-[0.8rem] items-center min-h-20 max-h-64 hover:translate-x-1 hover:[box-shadow:inset_-2px_-2px_0_0_#888888] font-[Press_Start_2P,monospace]"
      onClick={() => {
        if (href) {
          router.push(href)
        }
      }}
    >
      {/* Hover Arrow */}
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-text text-[0.8rem] z-10 hidden group-hover:block animate-pulse select-none">
        &#9658;
      </span>
      <div className="flex justify-center items-center">
        {icon && (
          <Image
            src={icon}
            alt={iconAlt || `${title} icon`}
            width={32}
            height={32}
            className="w-8 h-8 [image-rendering:pixelated]"
          />
        )}
      </div>

      <div className="flex flex-col gap-2 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:gap-3 relative">
          <div className="text-text [text-shadow:1px_1px_0px_#888888] text-base leading-[1.2] pr-2">
            {title}
          </div>

          {categories && categories.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {categories.map((category) => (
                <Tag
                  key={category.name}
                  label={category.name}
                  type={category.type}
                  className="text-[0.6rem] md:text-[0.7rem]"
                />
              ))}
            </div>
          )}
        </div>

        {description && (
          <div className="hidden lg:block leading-[1.4] text-text line-clamp-3">{description}</div>
        )}
      </div>

      <div className="flex items-center justify-center min-w-[100px] md:min-w-[180px] relative h-full">
        {/* Default (non-hover) content */}
        <div className="flex flex-col items-center justify-center gap-2 transition-all duration-200 w-full relative group-hover:hidden">
          <div className="text-gray-500 italic text-[0.6rem] md:text-[0.7rem] [text-shadow:1px_1px_0px_#888888] text-center">
            {formattedDate}
          </div>
          {stats?.readingTime && (
            <div className="flex items-center gap-1 text-[0.6rem] md:text-[0.7rem] text-gray-500 whitespace-nowrap">
              <Image src="/clock-pixel-art.png" alt="reading time" width={12} height={12} />
              {stats.readingTime} min
            </div>
          )}
        </div>
        {/* Hover content */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 flex-col items-center justify-center gap-2 w-full hidden group-hover:flex">
          <div className="flex flex-col items-center gap-2">
            {stats?.views !== undefined && (
              <div className="flex items-center gap-1 text-[0.6rem] md:text-[0.7rem] text-gray-500 whitespace-nowrap">
                <span role="img" aria-label="views">
                  👁️
                </span>
                {stats.views}
              </div>
            )}
            {stats?.likes !== undefined && (
              <div className="flex items-center gap-1 text-[0.6rem] md:text-[0.7rem] text-gray-500 whitespace-nowrap">
                <span role="img" aria-label="likes">
                  ❤️
                </span>
                {stats.likes}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function NoteList({
  children,
  className,
}: Readonly<{
  children: React.ReactNode
  className?: string
}>) {
  return (
    <div
      className={`press-start-2p-regular bg-background pixel-border [box-shadow:8px_8px_0_0_#888888] p-4 relative flex flex-col gap-3 ${className || ''}`}
    >
      {children}
    </div>
  )
}
