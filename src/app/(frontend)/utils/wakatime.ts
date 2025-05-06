import {
  ActivityData,
  LanguageData,
  EditorData,
  OperatingSystemData,
  WakaTimeDataItem,
} from '@/frontend/models/Wakatime'
import { ApiResponse } from '@/frontend/api'

// Define the possible structure of WakaTime API responses
interface WakaTimeLanguagesResponse {
  data: WakaTimeDataItem[]
}

interface WakaTimeEditorsResponse {
  data: WakaTimeDataItem[]
}

interface WakaTimeOSResponse {
  data: WakaTimeDataItem[]
}

interface WakaTimeActivityResponse extends ActivityData {}

export async function fetchWakaTimeStats(): Promise<{
  activity: ActivityData
  languages: LanguageData
  editors: EditorData
  operatingSystems: OperatingSystemData
}> {
  try {
    const [languagesRes, editorsRes, osRes, activityRes] = await Promise.all([
      fetch('/api/wakatime/languages'),
      fetch('/api/wakatime/editors'),
      fetch('/api/wakatime/operating-systems'),
      fetch('/api/wakatime/code-activity'),
    ])

    if (!languagesRes.ok || !editorsRes.ok || !osRes.ok || !activityRes.ok) {
      throw new Error('Failed to fetch WakaTime stats')
    }

    const [languagesData, editorsData, operatingSystemsData, activityData] = (await Promise.all([
      languagesRes.json(),
      editorsRes.json(),
      osRes.json(),
      activityRes.json(),
    ])) as [
      ApiResponse<WakaTimeLanguagesResponse>,
      ApiResponse<WakaTimeEditorsResponse>,
      ApiResponse<WakaTimeOSResponse>,
      ApiResponse<WakaTimeActivityResponse>,
    ]

    // Validate all responses have succeeded
    if (
      !languagesData.success ||
      !editorsData.success ||
      !operatingSystemsData.success ||
      !activityData.success
    ) {
      throw new Error('One or more WakaTime API calls failed')
    }

    // Create a default empty data item to use when no data is available
    const defaultDataItem: WakaTimeDataItem = {
      name: 'No Data',
      percent: 100,
      color: '#cccccc',
      decimal: '0',
      digital: '0',
      hours: 0,
      minutes: 0,
      text: '0 hrs',
      total_seconds: 0,
    }

    // Process the language data
    const languages: LanguageData = {
      data:
        languagesData.data?.data &&
        Array.isArray(languagesData.data.data) &&
        languagesData.data.data.length > 0
          ? languagesData.data.data
          : [defaultDataItem],
    }

    // Process the editors data
    const editors: EditorData = {
      data:
        editorsData.data?.data &&
        Array.isArray(editorsData.data.data) &&
        editorsData.data.data.length > 0
          ? editorsData.data.data
          : [defaultDataItem],
    }

    // Process the OS data
    const operatingSystems: OperatingSystemData = {
      data:
        operatingSystemsData.data?.data &&
        Array.isArray(operatingSystemsData.data.data) &&
        operatingSystemsData.data.data.length > 0
          ? operatingSystemsData.data.data
          : [defaultDataItem],
    }

    // ActivityData has a different structure
    const activity: ActivityData = activityData.data || {
      days: [],
      languages: [],
      status: 'unavailable',
      is_up_to_date: false,
      is_up_to_date_pending_future: false,
      is_stuck: false,
      is_already_updating: false,
      range: '',
      percent_calculated: 0,
      writes_only: false,
      user_id: '',
      is_including_today: false,
      human_readable_range: '',
    }

    // Log the data for debugging
    console.log('Languages data structure:', languages)
    console.log('Editors data structure:', editors)
    console.log('OS data structure:', operatingSystems)

    return {
      languages,
      editors,
      operatingSystems,
      activity,
    }
  } catch (error) {
    console.error('Error fetching WakaTime stats:', error)
    throw error
  }
}
