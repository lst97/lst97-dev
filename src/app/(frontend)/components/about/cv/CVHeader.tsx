import React from 'react'
import Image from 'next/image'
import { IoLocationSharp } from 'react-icons/io5'
import { BsTelephoneFill } from 'react-icons/bs'
import { MdEmail } from 'react-icons/md'

interface CVHeaderProps {
  name: string
  jobTitle: string
  location: string
  phone: string
  email: string
  imageUrl: string
}

export const CVHeader: React.FC<CVHeaderProps> = ({
  name,
  jobTitle,
  location,
  phone,
  email,
  imageUrl,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 p-4 sm:p-8 bg-[#fff3c4] mb-6 sm:mb-8 border-b-2 border-dashed border-[#b58900]">
      <div className="flex-shrink-0 rounded-full p-1 border-2 border-dotted border-[#b58900]">
        <Image
          src={imageUrl}
          alt="Profile"
          width={100}
          height={100}
          className="rounded-full object-cover sm:w-[120px] sm:h-[120px]"
        />
      </div>
      <div className="flex-grow-1 text-center sm:text-left mt-3 sm:mt-0">
        <h1 className="text-xl sm:text-3xl font-bold m-0 text-[var(--text-color)] uppercase">
          {name}
        </h1>
        <div className="mt-2 sm:mt-2">
          <p className="text-sm sm:text-lg text-[var(--text-color)] my-2 sm:my-2">{jobTitle}</p>
          <div className="flex flex-col sm:flex-row text-[var(--text-color)] text-[10px] sm:text-base mt-3">
            <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  location,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="leading-5 no-underline text-inherit flex justify-center sm:justify-start items-center gap-1 sm:gap-2 transition-opacity duration-200 hover:opacity-80 text-[10px] sm:text-xs"
              >
                <IoLocationSharp
                  size={14}
                  className="text-[var(--accent-color)] w-5 h-5 sm:w-8 sm:h-8"
                />{' '}
                {location}
              </a>
            </div>
            <div className="w-full sm:w-2/3 flex flex-col items-center sm:items-start gap-2">
              <span className="flex items-center gap-1 sm:gap-2 mb-1 text-[10px] sm:text-xs">
                <BsTelephoneFill size={12} className="text-[var(--accent-color)] sm:text-base" />{' '}
                {phone}
              </span>
              <a
                href={`mailto:${email}`}
                className="no-underline text-inherit flex items-center gap-1 sm:gap-2 transition-opacity duration-200 hover:opacity-80 text-[10px] sm:text-xs"
              >
                <MdEmail size={14} className="text-[var(--accent-color)] sm:text-base" /> {email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
