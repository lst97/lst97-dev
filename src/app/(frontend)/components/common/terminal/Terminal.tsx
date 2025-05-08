'use client'
import React, { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'

export interface ChatMessage {
  sender: 'you' | 'ai'
  message: string
  isTyping?: boolean
}

interface TerminalProps {
  messages: ChatMessage[]
  setUserInput: (input: string) => void
  handleSendMessage: (message: string) => Promise<void>
}

export const Terminal: React.FC<TerminalProps> = ({
  messages,
  setUserInput,
  handleSendMessage,
}) => {
  const termRef = useRef<XTerm | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const term = new XTerm({ cursorBlink: true })
    termRef.current = term
    term.open(document.getElementById('terminal')!)

    let currentInput = ''
    term.onKey(({ key, domEvent }) => {
      if (domEvent.key === 'Enter') {
        term.write('\r\n')
        if (currentInput.trim()) {
          handleSendMessage(currentInput)
        } else {
          term.writeln('Nelson (Agent) $ Please type a message')
        }
        term.write('guest $ ')
        currentInput = ''
        setUserInput('')
      } else if (domEvent.key === 'Backspace') {
        currentInput = currentInput.slice(0, -1)
        term.write('\b \b')
      } else {
        currentInput += key
        term.write(key)
      }
    })

    return () => term.dispose()
  }, [setUserInput, handleSendMessage])

  useEffect(() => {
    if (termRef.current) {
      const term = termRef.current
      term.reset()

      // Display all messages
      if (messages.length > 0) {
        messages.forEach((msg) => {
          const prefix = msg.sender === 'ai' ? 'Nelson (Agent) $ ' : 'guest $ '
          term.writeln(`${prefix}${msg.message}`)
          term.writeln('')
        })
      } else {
        term.writeln('Nelson (Agent) $ Welcome! How can I help you today?')
      }

      term.write('guest $ ')
    }
  }, [messages])

  return (
    <>
      <div id="terminal" className="terminal-window" />
      <div ref={messagesEndRef} />
    </>
  )
}
