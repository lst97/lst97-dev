'use client'

import React from 'react'
import * as Select from '@radix-ui/react-select'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'

// Text Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  id?: string
  fullWidth?: boolean
  icon?: React.ReactNode
}

export const PixelInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', fullWidth = false, icon, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`

    const baseInputClasses = [
      'font-mono',
      'text-[1.2rem]',
      'p-4',
      'border-4',
      'border-[var(--color-border)]',
      'bg-[var(--color-hover)]',
      'text-[var(--color-text)]',
      'transition-all',
      'duration-300',
      'shadow-[4px_4px_0_var(--shadow-color)]',
      'focus:outline-none',
      'focus:-translate-x-0.5',
      'focus:-translate-y-0.5',
      'focus:shadow-[6px_6px_0_var(--shadow-color)]',
      error ? 'border-[var(--color-error)]' : '',
      fullWidth ? 'w-full' : '',
      icon ? 'pl-12' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="font-pixel text-[1.2rem] text-[var(--color-text)]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text)] opacity-70 z-10">
              {icon}
            </div>
          )}
          <input id={inputId} ref={ref} className={baseInputClasses} {...props} />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(181, 137, 0, 0.05) 2px, rgba(181, 137, 0, 0.05) 4px)',
              opacity: 0.5,
              mixBlendMode: 'overlay',
            }}
          />
        </div>
        {error && <span className="text-[var(--color-error)] text-[1rem] mt-1">{error}</span>}
      </div>
    )
  },
)
PixelInput.displayName = 'PixelInput'

// Selector Component
interface SelectItemProps {
  children: React.ReactNode
  value: string
  disabled?: boolean
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, value, disabled, ...props }, ref) => {
    return (
      <Select.Item
        value={value}
        disabled={disabled}
        ref={ref}
        className={[
          'font-mono',
          'text-[1.1rem]',
          'py-2',
          'px-6',
          'relative',
          'flex',
          'items-center',
          'pl-8',
          'select-none',
          'data-[highlighted]:bg-[var(--color-accent)]',
          'data-[highlighted]:text-[var(--color-button-text)]',
          'data-[highlighted]:outline-none',
          'data-[disabled]:text-gray-400',
          'data-[disabled]:pointer-events-none',
        ].join(' ')}
        {...props}
      >
        <Select.ItemIndicator className="absolute left-2 inline-flex items-center justify-center">
          <CheckIcon />
        </Select.ItemIndicator>
        {children}
      </Select.Item>
    )
  },
)
SelectItem.displayName = 'SelectItem'

interface PixelSelectProps {
  label?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  fullWidth?: boolean
  id?: string
  disabled?: boolean
}

export const PixelSelect = React.forwardRef<HTMLButtonElement, PixelSelectProps>(
  (
    {
      label,
      options,
      placeholder = 'Select an option',
      value,
      onChange,
      error,
      fullWidth = false,
      id,
      disabled = false,
    },
    ref,
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`
    const selectedLabel = value
      ? options.find((option) => option.value === value)?.label
      : placeholder

    // This ensures value is never undefined which can cause issues with Radix UI Select
    const safeValue = value || ''

    return (
      <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="font-pixel text-[1.2rem] text-[var(--color-text)] text-xs"
          >
            {label}
          </label>
        )}
        <Select.Root value={safeValue} onValueChange={onChange} disabled={disabled}>
          <Select.Trigger
            id={selectId}
            ref={ref}
            className={[
              'relative',
              'font-mono',
              'text-[1.2rem]',
              'p-4',
              'border-4',
              'border-[var(--color-border)]',
              'bg-[var(--color-hover)]',
              'text-[var(--color-text)]',
              'transition-all',
              'duration-300',
              'shadow-[4px_4px_0_var(--shadow-color)]',
              'focus:outline-none',
              'focus:-translate-x-0.5',
              'focus:-translate-y-0.5',
              'focus:shadow-[6px_6px_0_var(--shadow-color)]',
              'inline-flex',
              'items-center',
              'justify-between',
              'gap-1',
              error ? 'border-[var(--color-error)]' : '',
              fullWidth ? 'w-full' : '',
              disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
            aria-label={placeholder}
          >
            <div className="truncate">{selectedLabel}</div>
            <Select.Icon className="ml-2">
              <ChevronDownIcon />
            </Select.Icon>

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(181, 137, 0, 0.05) 2px, rgba(181, 137, 0, 0.05) 4px)',
                opacity: 0.5,
                mixBlendMode: 'overlay',
              }}
            />
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              position="popper"
              sideOffset={5}
              className={[
                'z-50',
                'overflow-hidden',
                'bg-[var(--color-card)]',
                'border-4',
                'border-[var(--color-border)]',
                'shadow-[8px_8px_0_var(--shadow-color)]',
                'animate-in',
                'fade-in-0',
                'zoom-in-95',
                'slide-in-from-top-2',
                fullWidth ? 'min-w-[--radix-select-trigger-width]' : '',
              ].join(' ')}
            >
              <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-[var(--color-hover)] text-[var(--color-text)] cursor-default">
                <ChevronUpIcon />
              </Select.ScrollUpButton>

              <Select.Viewport className="p-2">
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select.Viewport>

              <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-[var(--color-hover)] text-[var(--color-text)] cursor-default">
                <ChevronDownIcon />
              </Select.ScrollDownButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        {error && <span className="text-[var(--color-error)] text-[1rem] mt-1">{error}</span>}
      </div>
    )
  },
)
PixelSelect.displayName = 'PixelSelect'
