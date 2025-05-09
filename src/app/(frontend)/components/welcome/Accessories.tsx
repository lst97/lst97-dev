import Image from 'next/image'
import { PixelContainer } from '@/frontend/components/common/layout/Containers'
import { MelbourneTime } from '@/frontend/components/utils/LocalTime'
import { GitHubContributionsCalendar } from '@/frontend/components/utils/GitHubContributions'

export const Accessories = () => {
  return (
    <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 px-4 md:px-16 grid-rows-2">
      <PixelContainer className="flex relative h-full">
        <Image
          src="/melbourne-city-map.svg"
          width={512}
          height={512}
          alt={'mel-map'}
          className="w-full h-full object-cover absolute top-0 left-0 opacity-5"
        />
        <MelbourneTime />
      </PixelContainer>
      <PixelContainer>
        <GitHubContributionsCalendar className="flex items-center justify-center m-4" />
      </PixelContainer>
      <PixelContainer className="flex flex-col items-center justify-center gap-4 press-start-2p-regular h-full p-4">
        <h3>Visit Counter</h3>
        <div className="text-center text-sm">In development</div>
      </PixelContainer>
      <PixelContainer className="flex flex-col items-center justify-center gap-4 press-start-2p-regular h-full p-4">
        <p>More coming soon...</p>
      </PixelContainer>
    </div>
  )
}
