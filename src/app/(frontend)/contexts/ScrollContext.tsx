import React, { createContext, useContext, useState } from 'react'

interface ScrollContextType {
  isNavbarVisible: boolean
  setIsNavbarVisible: (visible: boolean) => void
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined)

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true)

  return (
    <ScrollContext.Provider value={{ isNavbarVisible, setIsNavbarVisible }}>
      {children}
    </ScrollContext.Provider>
  )
}

export function useScroll() {
  const context = useContext(ScrollContext)
  if (context === undefined) {
    throw new Error('useScroll must be used within a ScrollProvider')
  }
  return context
}
