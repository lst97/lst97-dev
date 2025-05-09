'use client'

import React from 'react'
import { PageLoading } from './Loading'

interface ClientPageLoadingProps {
  message?: string
}

/**
 * A client-only wrapper for PageLoading that can be safely imported
 * in client components without the "export * in client boundary" error.
 */
const ClientPageLoading: React.FC<ClientPageLoadingProps> = ({ message }) => {
  return <PageLoading message={message} />
}

export default ClientPageLoading
