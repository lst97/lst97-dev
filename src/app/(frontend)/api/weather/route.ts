import { NextRequest } from 'next/server'

const WEATHER_API_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=22.2783&longitude=114.1747&hourly=temperature_2m&timezone=Asia%2FSingapore&forecast_days=1'

interface OpenMeteoApiResponse {
  hourly?: {
    time?: string[]
    temperature_2m?: number[]
  }
}

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(WEATHER_API_URL)
    if (!response.ok) {
      return Response.json(
        { maxTemperature: null, currentTemperature: null, error: 'Weather API error' },
        { status: 500 },
      )
    }
    const data: OpenMeteoApiResponse = await response.json()
    if (!data.hourly || !data.hourly.time || !data.hourly.temperature_2m) {
      return Response.json(
        { maxTemperature: null, currentTemperature: null, error: 'Invalid API response format.' },
        { status: 500 },
      )
    }
    const { time, temperature_2m } = data.hourly
    const maxTemperature = Math.max(...temperature_2m)
    // Calculate median
    const sortedTemps = [...temperature_2m].sort((a, b) => a - b)
    const mid = Math.floor(sortedTemps.length / 2)
    let medianTemperature
    if (sortedTemps.length % 2 === 0) {
      medianTemperature = (sortedTemps[mid - 1] + sortedTemps[mid]) / 2
    } else {
      medianTemperature = sortedTemps[mid]
    }
    const now = new Date()
    const currentHour = now.toISOString().slice(0, 13) + ':00'
    const currentHourIndex = time.indexOf(currentHour)
    let currentTemperature = null
    if (currentHourIndex !== -1) {
      currentTemperature = temperature_2m[currentHourIndex]
    }
    return Response.json({ maxTemperature, currentTemperature, medianTemperature, error: null })
  } catch (error) {
    return Response.json(
      { maxTemperature: null, currentTemperature: null, error: 'Could not fetch weather data.' },
      { status: 500 },
    )
  }
}
