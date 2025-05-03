import React from 'react'
import { Tags } from '@/frontend/components/ui/Tags'

interface ProjectDetailsSectionProps {
  client: string
  industry: string
  services: string[]
}

export const ProjectDetailsSection: React.FC<ProjectDetailsSectionProps> = ({
  client,
  industry,
  services,
}) => (
  <div className="font-['Press_Start_2P'] p-4 sm:p-6 md:p-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      <div>
        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-primary pb-4 sm:pb-6 md:pb-8 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)]">
          CLIENT
        </h3>
        <p className="pb-4 sm:pb-6 md:pb-8 text-black/40 text-sm sm:text-base md:text-md">
          {client}
        </p>
      </div>
      <div>
        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-primary pb-4 sm:pb-6 md:pb-8 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)]">
          INDUSTRY
        </h3>
        <p className="pb-4 sm:pb-6 md:pb-8 text-black/40 text-sm sm:text-base md:text-md">
          {industry}
        </p>
      </div>
      <div>
        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-primary pb-4 sm:pb-6 md:pb-8 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)]">
          SERVICES
        </h3>
        {services && services.length > 0 && <Tags tags={services} />}
      </div>
    </div>
  </div>
)
