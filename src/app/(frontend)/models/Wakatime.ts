export interface Category {
  name: string
  total: number
}

export interface Day {
  date: string
  total: number
  categories: Category[]
}

export interface Language {
  name: string
  hours: number
}

export interface ActivityData {
  days: Day[]
  languages: Language[]
  status: string
  is_up_to_date: boolean
  is_up_to_date_pending_future: boolean
  is_stuck: boolean
  is_already_updating: boolean
  range: string
  percent_calculated: number
  writes_only: boolean
  user_id: string
  is_including_today: boolean
  human_readable_range: string
}

// Define a single data item in the WakaTime API response
export interface WakaTimeDataItem {
  name: string
  percent: number
  color: string
  decimal: string
  digital: string
  hours: number
  minutes: number
  text: string
  total_seconds: number
}

// Changed from tuple type [WakaTimeDataItem] to array type WakaTimeDataItem[]
export interface BaseBarData {
  data: WakaTimeDataItem[]
}

export interface LanguageData extends BaseBarData {}

export interface EditorData extends BaseBarData {}

export interface OperatingSystemData extends BaseBarData {}
