import { useQuery } from '@tanstack/react-query'
import { ApiResponse } from '@/frontend/api'

export interface WeatherData {
  maxTemperature: number | null
  currentTemperature: number | null
  medianTemperature?: number | null
}

export function useWeather() {
  return useQuery<WeatherData>({
    queryKey: ['weather'],
    queryFn: async () => {
      const response = await fetch('/api/weather')
      if (!response.ok) throw new Error('Weather API error')

      const data = (await response.json()) as ApiResponse<WeatherData>

      if (!data.success || !data.data) {
        throw new Error(data.error?.message || 'Failed to fetch weather data')
      }

      return data.data
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export default useWeather
