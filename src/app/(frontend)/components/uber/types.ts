import React from 'react'

/**
 * Stat interface for the stats section
 */
export interface Stat {
  icon: React.ReactNode
  number: string
  label: string
  description: string
}

/**
 * Gear interface for the gear section
 */
export interface Gear {
  id: number
  name: string
  description: string
  image: string
  features: string[]
}

/**
 * Comment interface for the comments section
 */
export interface Comment {
  id: number
  customerName: string
  rating: number
  comment: string
  date: string
  orderType: string
}
