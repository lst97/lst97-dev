import { fetchWakaTimeData } from '../utils'

export async function GET() {
  return fetchWakaTimeData(
    'https://wakatime.com/share/@lst97/03e931cb-b575-4116-bcaa-30cbb97ec3b2.json',
  )
}
