import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function VercelProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SpeedInsights />
      <Analytics />
      {children}
    </>
  )
}
