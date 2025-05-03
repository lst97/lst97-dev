import React from 'react'
import { Button } from '@/frontend/components/ui/Buttons'

interface VisitWebsiteButtonProps {
  websiteUrl: string
}

export const VisitWebsiteButton: React.FC<VisitWebsiteButtonProps> = ({ websiteUrl }) => (
  <div className="flex justify-center pb-16">
    <Button onClick={() => window.open(websiteUrl, '_blank')} variant="pixel">
      Visit Website
    </Button>
  </div>
)
