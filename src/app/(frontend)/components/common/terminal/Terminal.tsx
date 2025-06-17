'use client'
import React, { useRef, useState, useMemo } from 'react'
import Markdown from 'react-markdown'
import { AVAILABLE_COMMANDS } from '@/frontend/constants/data/ai-chat'
import Turnstile from '@/frontend/components/security/Turnstile'

export interface ChatMessage {
  sender: 'you' | 'ai'
  message: string
  isTyping?: boolean
  isMarkdown?: boolean
}

interface TerminalProps {
  messages: ChatMessage[]
  setUserInput: (input: string) => void
  handleSendMessage: (message: string) => Promise<void>
  onTurnstileVerify?: (token: string) => void
  onTurnstileExpired?: () => void
  isTurnstileVerified?: boolean
  turnstileError?: string
}

export const Terminal: React.FC<TerminalProps> = ({
  messages,
  setUserInput,
  handleSendMessage,
  onTurnstileVerify,
  onTurnstileExpired,
  isTurnstileVerified = false,
  turnstileError,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [typingFrame, setTypingFrame] = useState(0)
  const [currentInput, setCurrentInput] = useState('')
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false)
  const [shouldShowTurnstile, setShouldShowTurnstile] = useState(false)

  // Animated typing indicator
  const typingFrames = useMemo(() => ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'], [])

  // Get command suggestions based on current input
  const commandSuggestions = useMemo(() => {
    if (!currentInput.startsWith('/')) {
      return []
    }

    // If user just typed '/', show all commands
    if (currentInput === '/') {
      return AVAILABLE_COMMANDS
    }

    // If user typed more than '/', filter commands
    if (currentInput.length >= 2) {
      const searchTerm = currentInput.toLowerCase()
      return AVAILABLE_COMMANDS.filter(
        (cmd) => cmd.toLowerCase().startsWith(searchTerm) && cmd !== currentInput,
      )
    }

    return []
  }, [currentInput])

  // Function to detect if content contains markdown
  const hasMarkdownSyntax = (text: string): boolean => {
    const markdownPatterns = [
      /^#{1,6}\s+/, // Headers
      /\*\*.*\*\*/, // Bold
      /\*.*\*/, // Italic
      /`.*`/, // Inline code
      /```[\s\S]*?```/, // Code blocks
      /^\s*[-*+]\s+/, // Lists
      /^\s*\d+\.\s+/, // Numbered lists
      /\[.*\]\(.*\)/, // Links
      /!\[.*\]\(.*\)/, // Images
      /^\s*>\s+/, // Blockquotes
    ]
    return markdownPatterns.some((pattern) => pattern.test(text))
  }

  // Scroll to top of website smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // Animate typing indicator
  React.useEffect(() => {
    const hasTypingMessage = messages.some((msg) => msg.isTyping)
    if (!hasTypingMessage) return

    const interval = setInterval(() => {
      setTypingFrame((prev) => (prev + 1) % typingFrames.length)
    }, 100)

    return () => clearInterval(interval)
  }, [messages, typingFrames])

  // Auto-scroll to bottom of chat and top of website when new messages arrive
  React.useEffect(() => {
    // Scroll within the chat container
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

    // Scroll to top of the website
    scrollToTop()
  }, [messages])

  // Reset shouldShowTurnstile when verification is successful
  React.useEffect(() => {
    if (isTurnstileVerified) {
      setShouldShowTurnstile(false)
    }
  }, [isTurnstileVerified])

  // Handle input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Check if Turnstile is verified for non-command messages
    if (!currentInput.startsWith('/') && !isTurnstileVerified) {
      return // Don't submit if Turnstile is not verified
    }

    if (currentInput.trim()) {
      handleSendMessage(currentInput.trim())
      setCurrentInput('')
      setUserInput('')
      setShowCommandSuggestions(false)
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setCurrentInput(value)
    setUserInput(value)

    // Show command suggestions if typing a command
    setShowCommandSuggestions(value.startsWith('/'))

    // Auto-show Turnstile when user starts typing a non-command message and isn't verified
    // This handles both initial typing and typing after verification has been reset
    if (value.length > 0 && !value.startsWith('/') && !isTurnstileVerified) {
      setShouldShowTurnstile(true)
    } else if (value.startsWith('/') || value.length === 0) {
      setShouldShowTurnstile(false)
    }

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
    // Handle Tab for command completion
    else if (e.key === 'Tab' && commandSuggestions.length > 0) {
      e.preventDefault()
      const firstSuggestion = commandSuggestions[0]
      setCurrentInput(firstSuggestion)
      setUserInput(firstSuggestion)
      setShowCommandSuggestions(false)
    }
    // Hide suggestions on Escape
    else if (e.key === 'Escape') {
      setShowCommandSuggestions(false)
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (command: string) => {
    setCurrentInput(command)
    setUserInput(command)
    setShowCommandSuggestions(false)
    textareaRef.current?.focus()
  }

  return (
    <div className="chat-container flex flex-col h-full min-h-[400px]">
      {/* Messages display area */}
      <div className="messages-container overflow-y-auto flex-1 max-h-96 mb-4 font-['Press_Start_2P'] text-xs bg-black p-4 rounded-t-md min-h-[300px]">
        {messages.map((msg, index) => {
          const prefix = msg.sender === 'ai' ? '🤖 Nelson (Agent) $' : '👤 guest $'

          if (msg.isTyping) {
            return (
              <div key={`typing-${index}`} className="mb-2 text-amber-400">
                <span className="text-amber-300">{prefix}</span>
                <span className="ml-2">thinking... {typingFrames[typingFrame]}</span>
              </div>
            )
          }

          const isMarkdown = msg.isMarkdown || hasMarkdownSyntax(msg.message)

          return (
            <div key={index} className="mb-3">
              <div className="text-amber-300 font-['Press_Start_2P'] text-xs mb-1">{prefix}</div>
              {isMarkdown ? (
                <div className="ml-4 text-amber-400 markdown-content">
                  <Markdown
                    components={{
                      // Customize markdown components for terminal styling
                      h1: ({ children }) => (
                        <h1 className="text-lg font-bold text-amber-300 mb-2">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-base font-bold text-amber-300 mb-2">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-sm font-bold text-amber-300 mb-1">{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-amber-400 mb-2 leading-relaxed">{children}</p>
                      ),
                      code: ({ children }) => (
                        <code className="bg-gray-800 text-yellow-400 px-1 rounded">{children}</code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-gray-800 text-yellow-400 p-2 rounded mb-2 overflow-x-auto">
                          {children}
                        </pre>
                      ),
                      strong: ({ children }) => (
                        <strong className="text-amber-300 font-bold">{children}</strong>
                      ),
                      em: ({ children }) => <em className="text-amber-300 italic">{children}</em>,
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside text-amber-400 mb-2 ml-4">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside text-amber-400 mb-2 ml-4">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-amber-300 pl-4 italic text-amber-300 mb-2">
                          {children}
                        </blockquote>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          className="text-blue-400 underline hover:text-blue-300"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {msg.message}
                  </Markdown>
                </div>
              ) : (
                <div className="ml-4 text-amber-400 whitespace-pre-wrap">{msg.message}</div>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Command suggestions */}
      {showCommandSuggestions && commandSuggestions.length > 0 && (
        <div className="command-suggestions bg-gray-800 border border-amber-500 rounded mb-2 p-2">
          <div className="text-amber-300 font-['Press_Start_2P'] text-xs mb-1">
            {currentInput === '/'
              ? 'Available commands (Press Tab or click):'
              : 'Command suggestions (Press Tab or click):'}
          </div>
          <div className="flex flex-wrap gap-1">
            {commandSuggestions.map((cmd) => (
              <button
                key={cmd}
                onClick={() => handleSuggestionClick(cmd)}
                className="text-amber-400 hover:text-amber-300 hover:bg-amber-500 hover:bg-opacity-20 font-['Press_Start_2P'] text-xs px-2 py-1 border border-amber-600 rounded transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Turnstile Security - Show when user starts typing non-command messages */}
      {(shouldShowTurnstile ||
        (currentInput.length > 0 && !currentInput.startsWith('/') && !isTurnstileVerified)) &&
        onTurnstileVerify && (
          <div className="turnstile-container bg-gray-800 border border-amber-500 rounded mb-2 p-2">
            <div className="text-amber-300 font-['Press_Start_2P'] text-xs mb-2">
              Security verification required to send messages:
            </div>
            {turnstileError && (
              <div className="text-red-400 font-['Press_Start_2P'] text-xs mb-2 bg-red-900 bg-opacity-20 p-2 rounded border border-red-500">
                {turnstileError}
              </div>
            )}
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
              onVerify={onTurnstileVerify}
              onExpired={onTurnstileExpired}
              action="ai_chat"
              key={`${turnstileError}-${isTurnstileVerified}`} // Force re-render when verification state changes
            />
          </div>
        )}

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="input-area bg-black rounded-b-md p-2 border-t border-amber-500"
      >
        <div className="flex items-start space-x-2">
          <span className="text-amber-300 font-['Press_Start_2P'] text-xs mt-2">👤 guest $</span>
          <textarea
            ref={textareaRef}
            value={currentInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Type your message or /help for commands... (Shift+Enter for new line)"
            className={`flex-1 bg-transparent font-['Press_Start_2P'] text-xs outline-none placeholder-amber-600 resize-none min-h-[24px] max-h-[120px] ${
              currentInput.startsWith('/') ? 'text-green-400' : 'text-amber-400'
            }`}
            rows={1}
            autoFocus
          />
          <button
            type="submit"
            disabled={!currentInput.startsWith('/') && !isTurnstileVerified}
            className={`font-['Press_Start_2P'] text-xs px-2 py-1 border rounded transition-colors mt-1 ${
              !currentInput.startsWith('/') && !isTurnstileVerified
                ? 'text-amber-600 border-amber-600 cursor-not-allowed opacity-50'
                : 'text-amber-400 hover:text-amber-300 border-amber-500 hover:bg-amber-500 hover:bg-opacity-20'
            }`}
          >
            Send
          </button>
        </div>
        <div className="text-amber-600 font-['Press_Start_2P'] text-xs mt-1 text-right">
          {!currentInput.startsWith('/') && !isTurnstileVerified
            ? 'Complete security verification to send messages'
            : currentInput.startsWith('/')
              ? 'Command mode - Press Tab for autocomplete, Enter to execute'
              : 'Press Enter to send, Shift+Enter for new line'}
        </div>
      </form>
    </div>
  )
}
