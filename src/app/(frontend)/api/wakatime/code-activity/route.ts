import { fetchWakaTimeData } from '../utils'

export async function GET() {
  return fetchWakaTimeData(
    'https://wakatime.com/share/@lst97/76203622-6a11-46b7-9782-9f6d9ae09452.json',
  )
}
