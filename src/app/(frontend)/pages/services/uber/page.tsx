import React from 'react'
import { Metadata } from 'next'
import UberClient from './UberClient'

export const metadata: Metadata = {
  title: 'Professional Uber Delivery Driver | LST97',
  description:
    'Professional Uber delivery driver with 2000+ deliveries, 98% customer rating, and 0% cancellation rate. Treating every order with care and precision.',
  keywords: [
    'uber driver',
    'delivery service',
    'professional delivery',
    'food delivery',
    'uber eats',
  ],
}

/**
 * Server component for the Uber delivery driver page.
 * This page showcases professional delivery services and statistics.
 */
export default function UberPage() {
  return <UberClient />
}
