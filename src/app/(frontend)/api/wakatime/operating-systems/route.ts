import { fetchWakaTimeData } from '../utils'

export async function GET() {
  return fetchWakaTimeData(
    'https://wakatime.com/share/@lst97/f0f2cc83-a33e-4abc-aa2e-5caf86998f67.json',
  )
}
