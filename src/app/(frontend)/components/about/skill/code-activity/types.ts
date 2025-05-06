import { ActivityData } from '@/frontend/models/Wakatime'

export interface CodingActivityProps {
  activity?: ActivityData
  inView?: boolean
  variant?: 'Front' | 'Back'
  width: string | number // Required by FlipCard
  height: string | number // Required by FlipCard
  style?: React.CSSProperties
  isLoading?: boolean
  error?: string
}

export interface ProgrammingLevelType {
  progLevel: string
  hrs: string
  pilotEquiv: string
  desc: string
  range: [number, number]
}
