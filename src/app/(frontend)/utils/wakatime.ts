import {
  ActivityData,
  LanguageData,
  EditorData,
  OperatingSystemData,
} from '@/frontend/models/Wakatime'

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

    const [languages, editors, operatingSystems, activity] = await Promise.all([
      languagesRes.json(),
      editorsRes.json(),
      osRes.json(),
      activityRes.json(),
    ])

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
