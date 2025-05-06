'use client'
import React, { createContext, useMemo, useState, Dispatch, SetStateAction } from 'react'
import Navbar from './Navbar'
import { PixelContainer } from '../common/layout/Containers'
import { ScrollProvider } from '@/frontend/contexts/ScrollContext'
import { Footer } from '@/frontend/components/footer/Footer'

interface NavbarRefreshContextProps {
  triggerRefresh: boolean
  setTriggerRefresh: Dispatch<SetStateAction<boolean>>
}

const NavbarRefreshContext = createContext<NavbarRefreshContextProps>({
  triggerRefresh: false,
  setTriggerRefresh: () => {},
})

export function Dashboard({ children }: Readonly<{ children?: React.ReactNode }>) {
  const [triggerRefresh, setTriggerRefresh] = useState(false)

  const memoizedValue = useMemo(
    () => ({ triggerRefresh, setTriggerRefresh }),
    [triggerRefresh, setTriggerRefresh],
  )

  return (
    <ScrollProvider>
      <NavbarRefreshContext.Provider value={memoizedValue}>
        <Navbar className="w-full" />
        <main className="grow w-full max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-8 py-4 pt-12 lg:pt-24">
          <div className="min-h-[calc(100vh-140px)] lg:min-h-[calc(100vh-200px)]">{children}</div>
        </main>
        <Footer />
      </NavbarRefreshContext.Provider>
    </ScrollProvider>
  )
}
