import { NextRequest, NextResponse } from 'next/server'
import { createSuccessResponse, createErrorResponse, HttpStatus, CACHE_CONTROL } from '../index'

const WEATHER_API_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=22.2783&longitude=114.1747&hourly=temperature_2m&timezone=Asia%2FSingapore&forecast_days=1'

interface WeatherData {
  maxTemperature: number | null
  currentTemperature: number | null
  medianTemperature: number | null
}

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
      return NextResponse.json(createErrorResponse('WEATHER_API_ERROR', 'Weather API error'), {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      })
    }

    const data: OpenMeteoApiResponse = await response.json()

    if (!data.hourly || !data.hourly.time || !data.hourly.temperature_2m) {
      return NextResponse.json(
        createErrorResponse('INVALID_RESPONSE', 'Invalid API response format.'),
        { status: HttpStatus.INTERNAL_SERVER_ERROR },
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

    const weatherData: WeatherData = {
      maxTemperature,
      currentTemperature,
      medianTemperature,
    }

    return NextResponse.json(createSuccessResponse(weatherData), {
      status: HttpStatus.OK,
      headers: {
        'Cache-Control': CACHE_CONTROL.SHORT, // Cache for 1 minute
      },
    })
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      createErrorResponse('WEATHER_DATA_ERROR', 'Could not fetch weather data.'),
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    )
  }
}
