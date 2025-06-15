'use client'

import React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { motion } from 'framer-motion'

interface AccordionItemProps {
  value: string
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

interface AccordionProps {
  children: React.ReactNode
  type?: 'single' | 'multiple'
  defaultValue?: string | string[]
  className?: string
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  value,
  title,
  children,
  defaultOpen = false,
}) => {
  return (
    <AccordionPrimitive.Item
      value={value}
      className="mb-4 border-4 border-border bg-card shadow-[4px_4px_0_#000] rounded-none overflow-hidden"
    >
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between p-4 font-['Press_Start_2P'] text-sm text-text bg-card hover:bg-hover transition-colors duration-200 group [&[data-state=open]>svg]:rotate-180 hover:cursor-pointer">
          <span>{title}</span>
          <ChevronDownIcon className="h-4 w-4 shrink-0 transition-transform duration-200" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <motion.div
          className="p-4 pt-0"
          initial={defaultOpen ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  )
}

const Accordion: React.FC<AccordionProps> & { Item: typeof AccordionItem } = ({
  children,
  type = 'multiple',
  defaultValue,
  className = '',
}) => {
  const rootProps =
    type === 'single'
      ? { type: 'single' as const, defaultValue: defaultValue as string }
      : { type: 'multiple' as const, defaultValue: defaultValue as string[] }

  return (
    <AccordionPrimitive.Root {...rootProps} className={`w-full ${className}`}>
      {children}
    </AccordionPrimitive.Root>
  )
}

Accordion.Item = AccordionItem

export { Accordion, AccordionItem }
export default Accordion
