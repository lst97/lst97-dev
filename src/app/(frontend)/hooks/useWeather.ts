import { useQuery } from '@tanstack/react-query'

export interface WeatherData {
  maxTemperature: number | null
  currentTemperature: number | null
  medianTemperature?: number | null
  error: string | null
}

export function useWeather() {
  return useQuery<WeatherData>({
    queryKey: ['weather'],
    queryFn: async () => {
      const response = await fetch('/api/weather')
      if (!response.ok) throw new Error('Weather API error')
      return (await response.json()) as WeatherData
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export default useWeather
