'use client'

import React, { useState } from 'react'
import { PixelSelect } from './Inputs'

// Types
export type SortOption = {
  label: string
  value: string
  direction?: 'asc' | 'desc'
}

export type FilterOption = {
  label: string
  value: string
  disabled?: boolean
}

// Filter option group props
export interface FilterGroupProps {
  label: string
  options: FilterOption[]
  selectedValues: string[]
  onChange: (selectedValues: string[]) => void
  isMultiSelect?: boolean
  className?: string
}

// Main filter controls props
export interface FilterControlsProps {
  sortOptions?: SortOption[]
  onSortChange?: (option: SortOption) => void
  selectedSort?: string
  filterGroups?: {
    label: string
    options: FilterOption[]
    selectedValues: string[]
    onChange: (selectedValues: string[]) => void
    isMultiSelect?: boolean
  }[]
  className?: string
}

// Filter option group component (checkbox or radio style)
export const FilterGroup: React.FC<FilterGroupProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  isMultiSelect = true,
  className,
}) => {
  const handleOptionClick = (value: string) => {
    if (isMultiSelect) {
      // Checkbox style - multiple selection
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value]
      onChange(newValues)
    } else {
      // Radio style - single selection
      onChange([value])
    }
  }

  return (
    <div className={`flex flex-col gap-2 ${className || ''}`}>
      <span className="font-pixel text-[1.2rem] text-[var(--color-text)] dark:text-[var(--color-text-light)]">
        {label}
      </span>
      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto bg-[var(--color-hover)] dark:bg-[var(--color-hover-dark)] border-4 border-[var(--color-border)] dark:border-[var(--color-border-dark)] p-4 rounded-md shadow-[4px_4px_0_var(--shadow-color)]">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleOptionClick(option.value)}
            disabled={option.disabled}
            className={`font-mono text-sm px-3 py-2 rounded-md transition-all duration-200 ${
              selectedValues.includes(option.value)
                ? 'bg-[var(--color-accent)] text-white shadow-[2px_2px_0_var(--shadow-color)] -translate-x-0.5 -translate-y-0.5'
                : 'bg-[var(--color-background)] dark:bg-[var(--color-background-dark)] text-[var(--color-text)] dark:text-[var(--color-text-light)] border-2 border-[var(--color-border)] dark:border-[var(--color-border-dark)] hover:bg-[var(--color-hover)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--shadow-color)]'
            } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-pressed={selectedValues.includes(option.value)}
            aria-label={`${isMultiSelect ? 'Toggle' : 'Select'} ${option.label}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// Main filter controls component
export const FilterControls: React.FC<FilterControlsProps> = ({
  sortOptions = [],
  onSortChange,
  selectedSort,
  filterGroups = [],
  className,
}) => {
  const handleSortChange = (value: string) => {
    if (onSortChange) {
      const option = sortOptions.find((opt) => opt.value === value)
      if (option) {
        onSortChange(option)
      }
    }
  }

  // Format options for PixelSelect
  const formattedSortOptions = sortOptions.map((option) => ({
    value: option.value,
    label: option.label,
  }))

  return (
    <div
      className={`bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border-4 border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-[8px_8px_0_var(--shadow)] rounded-md p-6 sm:p-8 relative ${className || ''}`}
    >
      {/* Pixel noise overlay */}
      <div
        className="bg-pixel-noise absolute inset-0 pointer-events-none z-0 opacity-10"
        aria-hidden="true"
      />

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-5 bg-grid-lines"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 gap-8 relative z-1">
        {/* Sort options */}
        {sortOptions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PixelSelect
              label="Sort by"
              options={formattedSortOptions}
              value={selectedSort || sortOptions[0]?.value || ''}
              onChange={handleSortChange}
              fullWidth
            />
          </div>
        )}

        {/* Filter groups */}
        {filterGroups.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filterGroups.map((group, index) => (
              <FilterGroup
                key={`filter-group-${index}`}
                label={group.label}
                options={group.options}
                selectedValues={group.selectedValues}
                onChange={group.onChange}
                isMultiSelect={group.isMultiSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
