'use client'

import { PixelContainer } from '@/frontend/components/common/layout/Containers'
import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { ChatMessage } from '@/frontend/components/common/terminal/Terminal'
import { TERMINAL_COMMANDS, AVAILABLE_COMMANDS } from '@/frontend/constants/data/ai-chat'

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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      message:
        "Hello! I'm Nelson, what can I help you with? Type **/help** to see available commands or ask me anything about lst97's portfolio and services!\n\n*Note: You'll need to complete a quick security verification before sending each message.*",
      isMarkdown: true,
    },
  ])
  const [_userInput, setUserInput] = useState<string>('')
  const [_isAITyping, setIsAITyping] = useState(false)
  const [isTurnstileVerified, setIsTurnstileVerified] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string>('')
  const [turnstileError, setTurnstileError] = useState<string>('')

  // Handle Turnstile verification
  const handleTurnstileVerify = useCallback((token: string) => {
    console.log('🔐 Turnstile verification received:', { tokenLength: token?.length || 0 })
    setTurnstileToken(token)
    setIsTurnstileVerified(true)
    setTurnstileError('') // Clear any previous errors
  }, [])

  // Handle Turnstile expiration/reset
  const handleTurnstileExpired = useCallback(() => {
    setIsTurnstileVerified(false)
    setTurnstileToken('')
    setTurnstileError('Security verification expired. Please verify again.')

    // Show expiration message
    setMessages((prev) => [
      ...prev,
      {
        sender: 'ai',
        message:
          '⚠️ Security verification expired. Please complete verification again to send messages.',
        isMarkdown: false,
      },
    ])
  }, [])

  // Handle terminal commands
  const handleTerminalCommand = useCallback(
    (command: string): boolean => {
      const normalizedCommand = command.toLowerCase().trim()

      // Check if command exists in available commands
      if (!AVAILABLE_COMMANDS.includes(normalizedCommand)) {
        return false
      }

      // Handle /clear command specially
      if (normalizedCommand === '/clear') {
        setMessages([
          {
            sender: 'ai',
            message:
              "Chat cleared! Type **/help** for available commands or ask me anything about lst97's work.",
            isMarkdown: true,
          },
        ])
        return true
      }

      // Handle other commands
      const commandHandler = TERMINAL_COMMANDS[normalizedCommand as keyof typeof TERMINAL_COMMANDS]
      if (commandHandler) {
        const response = commandHandler()
        if (response) {
          setMessages((prev) => [
            ...prev,
            { sender: 'you', message: command },
            { sender: 'ai', message: response, isMarkdown: true },
          ])
        }
        return true
      }

      return false
    },
    [setMessages],
  )

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (message.trim() === '') return

      // Check if it's a terminal command
      if (message.startsWith('/')) {
        const isCommand = handleTerminalCommand(message)
        if (isCommand) {
          return // Command handled locally
        }
      }

      const newUserMessage: ChatMessage = { sender: 'you', message }
      setMessages((prev) => [...prev, newUserMessage])
      setUserInput('')
      setIsAITyping(true)

      // Add a typing indicator message
      const typingMessage: ChatMessage = { sender: 'ai', message: '', isTyping: true }
      setMessages((prev) => [...prev, typingMessage])

      try {
        console.log('📤 Sending AI chat request:', {
          message: message.substring(0, 50) + '...',
          hasToken: !!turnstileToken,
          tokenLength: turnstileToken?.length || 0,
        })

        const res = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
            'x-turnstile-token': turnstileToken, // Include Turnstile token in headers
          },
          body: JSON.stringify({ message }),
        })

        const response = await res.json()

        // Remove the typing indicator
        setMessages((prev) => prev.filter((msg) => !msg.isTyping))

        if (!res.ok || !response.success) {
          // Handle API errors with proper error extraction
          let errorMessage = 'Sorry, I could not process your request.'

          if (response.error) {
            if (typeof response.error === 'object' && response.error.message) {
              errorMessage = response.error.message
            } else if (typeof response.error === 'string') {
              errorMessage = response.error
            }
          }

          // If it's a security error, reset Turnstile verification
          if (res.status === 401 || errorMessage.includes('verification')) {
            setIsTurnstileVerified(false)
            setTurnstileToken('')

            // Set specific error message based on the type
            if (errorMessage.includes('expired') || errorMessage.includes('already used')) {
              setTurnstileError(
                'Security verification expired. Please verify again to send your message.',
              )
            } else {
              setTurnstileError('Security verification failed. Please verify again.')
            }
          }

          setMessages((prev) => [...prev, { sender: 'ai', message: `Error: ${errorMessage}` }])
          return
        }

        // Handle the standardized API response format
        const aiReply = response.data?.reply

        if (!aiReply) {
          setMessages((prev) => [
            ...prev,
            { sender: 'ai', message: 'Sorry, I received an empty response.' },
          ])
          return
        }

        // Format the response to handle newlines and other formatting
        const formattedReply = aiReply
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\r/g, '\r')

        // Auto-detect markdown content
        const hasMarkdownSyntax = (text: string): boolean => {
          const markdownPatterns = [
            /^#{1,6}\s+/m, // Headers
            /\*\*.*\*\*/m, // Bold
            /\*.*\*/m, // Italic
            /`.*`/m, // Inline code
            /```[\s\S]*?```/m, // Code blocks
            /^\s*[-*+]\s+/m, // Lists
            /^\s*\d+\.\s+/m, // Numbered lists
            /\[.*\]\(.*\)/m, // Links
            /!\[.*\]\(.*\)/m, // Images
            /^\s*>\s+/m, // Blockquotes
          ]
          return markdownPatterns.some((pattern) => pattern.test(text))
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            message: formattedReply,
            isMarkdown: hasMarkdownSyntax(formattedReply),
          },
        ])

        // Reset Turnstile verification after successful message send
        // This ensures the user needs to verify again for the next message
        setIsTurnstileVerified(false)
        setTurnstileToken('')
      } catch (error) {
        console.error('AI Chat error:', error)

        // Remove the typing indicator
        setMessages((prev) => prev.filter((msg) => !msg.isTyping))

        const errorMessage = error instanceof Error ? error.message : 'Network error occurred'
        setMessages((prev) => [...prev, { sender: 'ai', message: `Error: ${errorMessage}` }])
      } finally {
        setIsAITyping(false)
      }
    },
    [setMessages, setUserInput, setIsAITyping, handleTerminalCommand, turnstileToken],
  )

  return (
    <div className="flex flex-col justify-center items-center mb-32 md:mb-0">
      <PixelContainer className="flex flex-col justify-center items-center bg-background-light w-full">
        {/* Chat title */}
        <div className="border-b-2 border-black w-full text-center font-['Press_Start_2P'] bg-secondary-light font-bold">
          Nelson (Agent)
        </div>

        {/* Terminal-like chat window */}
        <div className="rounded-b-md shadow-md w-full bg-black text-amber-400 p-4 font-['Press_Start_2P']">
          <DynamicTerminal
            messages={messages}
            setUserInput={setUserInput}
            handleSendMessage={handleSendMessage}
            onTurnstileVerify={handleTurnstileVerify}
            onTurnstileExpired={handleTurnstileExpired}
            isTurnstileVerified={isTurnstileVerified}
            turnstileError={turnstileError}
          />
        </div>
      </PixelContainer>
    </div>
  )
}
