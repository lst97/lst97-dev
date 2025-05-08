import { NavigationLink } from '@/frontend/components/ui/Links'
import Image from 'next/image'

export function PkmCard({
  children,
  title,
  description,
  src,
}: Readonly<{
  children?: React.ReactNode
  title: string
  description: string
  src?: string
}>) {
  return (
    <div
      className="group relative overflow-hidden border-4 border-black rounded-lg max-w-[800px] max-h-[400px] h-[400px] shadow-[inset_-2px_-2px_0px_#999,inset_2px_2px_0px_#fff] transition-transform duration-100"
      style={{
        backgroundColor: '#FFFFFF',
        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
      }}
    >
      <div className="bg-[#aa0000] h-[80px] flex items-center justify-center border-b-4 border-black rounded-none transition-all duration-200 relative group-hover:h-[40px] group-hover:-translate-y-2">
        <h3 className="font-['Press_Start_2P',monospace] text-[#fffbeb] text-center uppercase tracking-[1px] text-[1.2rem] transition-all duration-200 pixel-shadow group-hover:text-[0rem]">
          {title}
        </h3>
      </div>
      <div className="relative w-full h-[250px] transition-all duration-200 z-[1] group-hover:absolute group-hover:top-[40px] group-hover:left-0 group-hover:right-0 group-hover:h-[400px] group-hover:z-[2]">
        <Image
          className="w-full h-full object-cover"
          src={src ?? '/default-image.svg'}
          alt={title}
          fill
          objectFit="cover"
        />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 border-4 border-black rounded-lg p-2 font-['Press_Start_2P',monospace] text-[1rem] text-center leading-[1.2] text-black z-[2] opacity-100 transition-all duration-200 pointer-events-auto max-w-1/2 h-2/5 group-hover:opacity-0 group-hover:h-[40px]">
        <p>{description}</p>
      </div>
      {children && (
        <div className="absolute bottom-0 left-0 right-0 h-[80px] border-t-4 border-black bg-[#fef3c7] p-1 flex items-center justify-center transition-all duration-200 z-[1] group-hover:h-[40px] group-hover:translate-y-2 group-hover:text-[0rem]">
          {children}
        </div>
      )}
    </div>
  )
}

export function PkmCardLite({
  title,
  src,
  href,
}: Readonly<{
  title: string
  src?: string
  href?: string
}>) {
  return (
    <NavigationLink href={href ?? '#'} className="block">
      <div className="relative overflow-hidden border-4 border-black rounded-none bg-[#fef3c7] shadow-[inset_-2px_-2px_0px_#999,inset_2px_2px_0px_#fff] h-[300px] transition-transform duration-100 hover:scale-105 hover:shadow-[inset_-2px_-2px_0px_#999,inset_2px_2px_0px_#fff,0_2px_0_#000]">
        <div className="relative h-full w-full">
          <Image
            className="absolute object-cover h-full w-full"
            src={src ?? '/default-image.svg'}
            alt={title}
            fill
            objectFit="cover"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="font-['Press_Start_2P',monospace] text-[0.8rem] text-black bg-[#fef3c7] p-[2px_4px] border-2 border-black rounded-none uppercase tracking-[1px]">
              {title}
            </div>
          </div>
        </div>
      </div>
    </NavigationLink>
  )
}
