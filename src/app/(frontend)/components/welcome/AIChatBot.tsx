'use client'

import { PixelContainer } from '@/frontend/components/common/layout/Containers'
import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { ChatMessage } from '@/frontend/components/common/terminal/Terminal'
// Dynamically import the Terminal component to avoid server-side rendering issues
const DynamicTerminal = dynamic(
  () => import('@/frontend/components/common/terminal/Terminal').then((mod) => mod.Terminal),
  {
    loading: () => (
      <Image
        src="/loading-pixel-art.gif"
        alt="loading"
        width={128}
        height={128}
        unoptimized
        style={{
          width: '128px',
          height: '128px',
        }}
      />
    ),
    ssr: false,
  },
)

export const AIChatBot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [, setUserInput] = useState<string>('')
  const [, setIsAITyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (message: string) => {
    if (message.trim() === '') return

    const newUserMessage: ChatMessage = { sender: 'you', message }
    setMessages((prev) => [...prev, newUserMessage])
    setUserInput('')
    setIsAITyping(true)

    try {
      // Replace with your actual API endpoint
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', message: data.reply || 'Sorry, I could not understand.' },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', message: 'Error: Failed to get response from AI.' },
      ])
    } finally {
      setIsAITyping(false)
    }
  }

  return (
    <div className="flex flex-col justify-center items-center mb-32 md:mb-0">
      <PixelContainer className="flex flex-col justify-center items-center bg-background-light w-full">
        {/* Chat title */}
        <div className="border-b-2 border-black w-full text-center font-pkmn bg-secondary-light font-bold">
          Nelson (Agent)
        </div>

        {/* Terminal-like chat window */}
        <div className="rounded-b-md shadow-md w-full bg-black text-green-400 p-4 font-['Press_Start_2P']">
          <DynamicTerminal
            messages={messages}
            setUserInput={setUserInput}
            handleSendMessage={handleSendMessage}
          />
          <div ref={chatEndRef} />
        </div>
      </PixelContainer>
    </div>
  )
}
