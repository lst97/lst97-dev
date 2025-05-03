import { PkmCardLite } from '@/app/(frontend)/components/cards/Cards'
import { PkmTitle } from '@/frontend/components/common/Titles'
import Image from 'next/image'
export const FromTheLab = () => {
  return (
    <div>
      <div className="flex items-center justify-center mb-6 mt-8">
        <PkmTitle className="p-4 w-2/4 shadow-md">
          From the lab - EXPERIMENTAL{' '}
          <Image
            className="inline-block h-6 w-7"
            alt="☣️"
            src="/radioactive-pixel-art.png"
            width={24}
            height={24}
            style={{
              width: '24px',
              height: '24px',
            }}
          />
        </PkmTitle>
      </div>

      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 px-16">
        <PkmCardLite title={'Test but a little bit long'} />
        <PkmCardLite title={'Test'} />
        <PkmCardLite title={'Test'} />
      </div>
    </div>
  )
}
