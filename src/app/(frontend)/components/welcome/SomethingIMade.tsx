import { PkmCard } from '@/frontend/components/cards/Cards'
import { PkmTitle } from '@/frontend/components/common/Titles'

export const SomethingIMade = () => {
  return (
    <div>
      <div className="flex items-center justify-center mb-6 mt-8">
        <PkmTitle className="p-4 w-2/4">Something I have made</PkmTitle>
      </div>

      <div className="grid lg:grid-cols-2 grid-cols-1 gap-16 px-16">
        <PkmCard title={'Test'} description={'2018 * this is a test'}>
          <p>This is a test</p>
        </PkmCard>

        <PkmCard title={'Test'} description={'2018 * this is a test'}>
          <p>This is a test</p>
        </PkmCard>
      </div>
    </div>
  )
}
