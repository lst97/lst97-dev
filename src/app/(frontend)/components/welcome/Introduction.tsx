'use client'

import Image from 'next/image'
import { PkmLink } from '@/frontend/components/ui/Links'
import { useEffect, useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { introText, welcomeParagraphs, WelcomeParagraph } from '@/frontend/constants/data/welcome'
import { PixelContainer } from '@/frontend/components/common/layout/Containers'
import { contact } from '@/frontend/constants/data/contact'
import { ApiResponse } from '@/frontend/api'

// --- Constants ---
const TYPING_SPEED_BASE = 10
const TYPING_SPEED_COMMA = 300
const TYPING_SPEED_PERIOD = 400
const TYPING_SPEED_RANDOM_1 = 100
const TYPING_SPEED_RANDOM_1_RANGE = 25
const TYPING_SPEED_RANDOM_2 = 50
const TYPING_SPEED_RANDOM_2_RANGE = 4
const TYPING_COMPLETION_PAUSE = 1000

// --- Utility Functions ---
/**
 * Calculate age from birthday string (YYYY-MM-DD)
 */
function calculateAge(birthday: string): number {
  const birthDate = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

interface WeatherData {
  maxTemperature: number | null
  currentTemperature: number | null
  medianTemperature?: number | null
}

// welcomeParagraphs is an array of objects: { title: string, content: (string | { text: string, href: string })[][] }
// Each paragraph has a title and content, where content is an array of lines, and each line is an array of text or link objects.

// --- Subcomponents ---

/**
 * TypingIntro: Animated typing intro text
 */
interface TypingIntroProps {
  displayedText: string
  isTypingComplete: boolean
}
const TypingIntro: React.FC<TypingIntroProps> = ({ displayedText, isTypingComplete }) => (
  <PixelContainer className="max-w-xl min-w-[90vw] sm:min-w-[400px] sm:max-w-xl p-2 sm:p-4 mx-2 sm:mx-0 font-['Press_Start_2P'] text-base sm:text-md leading-7 text-text bg-secondary-light">
    <div className="relative flex-grow p-2 min-h-40 sm:min-h-52">
      <div
        className="m-0 p-0 w-full whitespace-pre-wrap break-words text-xs leading-8"
        aria-live="polite"
      >
        {displayedText}
        {!isTypingComplete && (
          <span className="inline-block w-2 h-4 bg-gray-700 animate-pulse ml-1 align-middle" />
        )}
      </div>
    </div>
    <p
      className={`mt-4 sm:mt-8 ${isTypingComplete ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 text-sm`}
    >
      Nice to meet you and welcome to my page!
    </p>
  </PixelContainer>
)

/**
 * ProfileCard: Shows profile image, weather, and HP bar
 */
interface ProfileCardProps {
  weatherData: WeatherData | null
  weatherError: boolean
  hpPercentage: number
  age: number
}
const ProfileCard: React.FC<ProfileCardProps> = ({
  weatherData,
  weatherError,
  hpPercentage,
  age,
}) => (
  <div className="flex flex-col items-center w-full max-w-xs sm:max-w-sm md:max-w-xs ">
    <div className="animate-bounce-slow">
      <Image
        src="/me-pixel-art.png"
        alt="Nelson"
        width={512}
        height={512}
        className="rounded-full shadow-lg hover:scale-110 transition duration-0 cursor-pointer object-cover lg:w-72 lg:h-72 md:w-64 md:h-64 sm:h-48 sm:w-48 w-32 h-32"
      />
    </div>
    <div className="bg-background-light border-4 border-gray-700 p-2 mt-2 w-full font-['Press_Start_2P'] text-xs rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-1 text-gray-700">
        Lv: {age} - Nelson{' '}
        <span className="text-[10px]">
          {weatherError || !weatherData ? (
            <span className="text-red-500">--/--</span>
          ) : (
            <>
              {weatherData.currentTemperature !== null
                ? Math.round(weatherData.currentTemperature)
                : '--'}
              /{weatherData.maxTemperature !== null ? Math.round(weatherData.maxTemperature) : '--'}
            </>
          )}
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 border-2 border-gray-700 relative rounded">
        <div
          className="h-full transition-all duration-500 rounded"
          style={{
            width: weatherError || !weatherData ? '100%' : `${hpPercentage}%`,
            backgroundColor:
              weatherError || !weatherData
                ? '#ccc'
                : hpPercentage > 50
                  ? '#48b850'
                  : hpPercentage > 25
                    ? '#f7d51d'
                    : '#ff5959',
          }}
        />
      </div>
      {weatherError && <div className="text-xs text-red-500 mt-1">Weather unavailable</div>}
    </div>
  </div>
)

/**
 * ParagraphSection: Shows the current paragraph and next button
 */
interface ParagraphSectionProps {
  currentParagraphIndex: number
  handleNextParagraph: () => void
}
const ParagraphSection: React.FC<ParagraphSectionProps> = ({
  currentParagraphIndex,
  handleNextParagraph,
}) => (
  <div className="flex flex-col items-center justify-center gap-4 sm:gap-8 relative w-full max-w-xl">
    <RenderParagraph paragraph={welcomeParagraphs[currentParagraphIndex]} />
    <button
      className="absolute bottom-2 right-2 cursor-pointer h-8 w-8 bg-yellow-300 border-2 border-black rounded-full flex items-center justify-center hover:bg-yellow-400 transition shadow-md"
      onClick={handleNextParagraph}
      aria-label="Next paragraph"
      type="button"
    >
      <span className="sr-only">Next paragraph</span>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7 5L13 10L7 15"
          stroke="#222"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  </div>
)

/**
 * RenderParagraph: Renders a single paragraph (used by ParagraphSection)
 */
interface RenderParagraphProps {
  paragraph: WelcomeParagraph
}
const RenderParagraph: React.FC<RenderParagraphProps> = ({ paragraph }) => (
  <PixelContainer className="relative bg-secondary-light mx-2 sm:mx-2">
    <div className="absolute -top-8 -left-1 bg-black text-gray-100 px-2 py-1 text-xs border-4 border-black rounded-t w-fit font-['Press_Start_2P'] font-bold ">
      {paragraph.title}
    </div>
    <div className="max-w-3xl p-2 sm:p-4">
      {paragraph.content.map((line, idx) => (
        <div key={idx} className={paragraph.title === 'About this site' ? '' : undefined}>
          {line.map((part, i) =>
            typeof part === 'string' ? (
              part
            ) : (
              <PkmLink key={i} href={part.href}>
                {part.text}
              </PkmLink>
            ),
          )}
        </div>
      ))}
    </div>
  </PixelContainer>
)

/**
 * GrassBackground: Shows the grass/gradient background
 */
const GrassBackground: React.FC = () => (
  <div className="relative w-full h-[60px] sm:h-[100px]">
    <div className="w-full h-full grass-scroll grass-scroll-bg"></div>
    <div
      className="pointer-events-none absolute inset-0 z-10"
      style={{
        background:
          'linear-gradient(to top, #fffbeb 0%, rgba(255,251,235,0.95) 40%, rgba(255,251,235,0) 60%),' +
          'linear-gradient(to right, #fffbeb 0%, rgba(255,251,235,0.95) 3%, rgba(255,251,235,0) 10%, rgba(255,251,235,0) 90%, rgba(255,251,235,0.95) 97%, #fffbeb 100%)',
      }}
    />
  </div>
)

// --- Main Component ---

export const Introduction = () => {
  const [displayedText, setDisplayedText] = useState('')
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0)

  // Typing animation effect
  useEffect(() => {
    if (currentCharIndex < introText.length) {
      let typingSpeed = TYPING_SPEED_BASE
      if (introText[currentCharIndex] === ',') {
        typingSpeed = TYPING_SPEED_COMMA
      } else if (introText[currentCharIndex] === '.') {
        typingSpeed = TYPING_SPEED_PERIOD
      } else if (Math.random() < 0.1) {
        typingSpeed = TYPING_SPEED_RANDOM_1 + Math.random() * TYPING_SPEED_RANDOM_1_RANGE
      } else if (Math.random() < 0.3) {
        typingSpeed = TYPING_SPEED_RANDOM_2 + Math.random() * TYPING_SPEED_RANDOM_2_RANGE
      }
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + introText[currentCharIndex])
        setCurrentCharIndex((prev) => prev + 1)
      }, typingSpeed)
      return () => clearTimeout(timer)
    } else if (!isTypingComplete) {
      const completionTimer = setTimeout(() => {
        setIsTypingComplete(true)
      }, TYPING_COMPLETION_PAUSE)
      return () => clearTimeout(completionTimer)
    }
  }, [currentCharIndex, isTypingComplete])

  // React Query: fetch weather data
  const {
    data: weatherData,
    isError: weatherError,
    error: weatherQueryError,
  } = useQuery<WeatherData>({
    queryKey: ['weather'],
    queryFn: async () => {
      const response = await fetch('/api/weather')
      if (!response.ok) throw new Error('Weather API error')

      const data = (await response.json()) as ApiResponse<WeatherData>

      if (!data.success || !data.data) {
        throw new Error(data.error?.message || 'Failed to fetch weather data')
      }

      return data.data
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  // Memoized derived values
  const age = useMemo(() => calculateAge(contact.birthday), [])
  const hpPercentage = useMemo(() => {
    if (
      !weatherData ||
      typeof weatherData.currentTemperature !== 'number' ||
      typeof weatherData.medianTemperature !== 'number'
    ) {
      return 100
    }
    const median = weatherData.medianTemperature
    const current = weatherData.currentTemperature
    const diff = Math.abs(current - median)
    const maxDiff = 10
    return Math.round(Math.max(0, 100 - (diff / maxDiff) * 100))
  }, [weatherData])

  const handleNextParagraph = () => {
    setCurrentParagraphIndex((prevIndex) => (prevIndex + 1) % welcomeParagraphs.length)
  }

  return (
    <div className="mt-4 sm:mt-8 w-full flex flex-col items-center px-2 sm:px-0">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 w-full max-w-4xl mx-auto">
        <TypingIntro displayedText={displayedText} isTypingComplete={isTypingComplete} />
        <ProfileCard
          weatherData={weatherData || null}
          weatherError={weatherError}
          hpPercentage={hpPercentage}
          age={age}
        />
        {/* Optionally, show loading/error state for weather */}
        {weatherError && (
          <div className="text-xs text-red-500 mt-2">
            Error loading weather:{' '}
            {weatherQueryError instanceof Error ? weatherQueryError.message : 'Unknown error'}
          </div>
        )}
      </div>
      <div className="lg:mt-16 sm:mt-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 lg:gap-32 mb-8 w-full">
        <Image
          src="/poke-w.png"
          alt="poke-w"
          className="bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 md:w-64 md:h-64 object-contain"
          width={250}
          height={250}
        />
        <ParagraphSection
          currentParagraphIndex={currentParagraphIndex}
          handleNextParagraph={handleNextParagraph}
        />
      </div>
      <GrassBackground />
    </div>
  )
}
