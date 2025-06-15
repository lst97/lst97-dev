export type BackgroundMode = 'color' | 'image'

export type PresetColor = {
  name: string
  value: string | null
  color: string
  pattern?: 'checkerboard'
}

export const COLOR_HISTORY_KEY = 'bg-remover-color-history'
export const MAX_HISTORY_ITEMS = 8

export const PRESET_COLORS: PresetColor[] = [
  { name: 'Transparent', value: null, color: 'transparent', pattern: 'checkerboard' },
  { name: 'Solid White', value: '#FFFFFF', color: '#FFFFFF' },
  { name: 'Solid Black', value: '#000000', color: '#000000' },
  { name: 'Soft White', value: '#F8F9FA', color: '#F8F9FA' },
  { name: 'Light Gray', value: '#E9ECEF', color: '#E9ECEF' },
  { name: 'Warm Beige', value: '#F5F5DC', color: '#F5F5DC' },
  { name: 'Soft Blue', value: '#E3F2FD', color: '#E3F2FD' },
  { name: 'Light Green', value: '#E8F5E8', color: '#E8F5E8' },
  { name: 'Pale Pink', value: '#FCE4EC', color: '#FCE4EC' },
  { name: 'Light Purple', value: '#F3E5F5', color: '#F3E5F5' },
]
