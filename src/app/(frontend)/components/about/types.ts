import { ComponentType } from 'react'
import {
  LanguageData,
  EditorData,
  OperatingSystemData,
  ActivityData,
} from '@/frontend/models/Wakatime'
import { CVData } from '@/frontend/models/CV'
import { TimelineEvent } from './timeline/Timeline'
import { SoftSkill } from '@/frontend/models/SoftSkill'

export interface SectionConfig {
  id: string
  label: string
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  Component: ComponentType<any>
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  props?: any
}

export interface AnimatedSectionsProps {
  wakaTimeStats?: {
    languages: LanguageData
    editors: EditorData
    operatingSystems: OperatingSystemData
    activity: ActivityData
  }
  timelineEvents: TimelineEvent[]
  cvData: CVData
  softSkills: SoftSkill[]
}
