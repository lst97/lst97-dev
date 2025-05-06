import { ProgrammingLevelType } from './types'

// Constants
export const SECONDS_TO_HOURS = 3600

// Colors
export const COLORS = {
  background: '#f3edd9',
  text: '#2c2c2c',
  highlight: '#cc9900',
  cell: {
    default: '#2c2c2c0d',
    border: 'rgba(44, 44, 44, 0.2)',
  },
}

// Theme constants
export const THEME = {
  colors: {
    primary: '#b58900',
    secondary: '#ffe580',
    tertiary: '#fff3c4',
    background: '#f3edd9',
    text: '#2c2c2c',
    border: '#2c2c2c',
  },
  fonts: {
    family: 'monospace',
  },
}

// Programming level table data
export const PROGRAMMING_LEVELS: ProgrammingLevelType[] = [
  {
    progLevel: 'Rookie',
    hrs: '0-500',
    pilotEquiv: 'Student',
    desc: 'Learning to code & debug',
    range: [0, 500],
  },
  {
    progLevel: 'Junior',
    hrs: '500-2K',
    pilotEquiv: 'Private',
    desc: 'Building real projects',
    range: [500, 2000],
  },
  {
    progLevel: 'Mid',
    hrs: '2K-5K',
    pilotEquiv: 'Commercial',
    desc: 'Systems & teamwork',
    range: [2000, 5000],
  },
  {
    progLevel: 'Senior',
    hrs: '5K-10K',
    pilotEquiv: 'Captain',
    desc: 'Leading & architecting',
    range: [5000, 10000],
  },
  {
    progLevel: 'Master',
    hrs: '10K+',
    pilotEquiv: 'Test Pilot',
    desc: 'Innovation & mastery',
    range: [10000, Infinity],
  },
]

// Common container class to reduce duplication
export const CONTAINER_CLASS =
  "relative bg-[#fff7e0] border-4 border-[#2c2c2c] p-8 my-4 [image-rendering:pixelated] shadow-[8px_8px_0_rgba(44,44,44,0.46)] w-full rounded-2xl overflow-hidden before:content-[''] before:absolute before:-top-1 before:-left-1 before:-right-1 before:-bottom-1 before:bg-transparent before:border-2 before:border-[#2c2c2c] before:pointer-events-none after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:bottom-0 after:bg-[linear-gradient(45deg,transparent_45%,#2c2c2c_45%,#2c2c2c_55%,transparent_55%),linear-gradient(-45deg,transparent_45%,#2c2c2c_45%,#2c2c2c_55%,transparent_55%)] after:bg-[length:8px_8px] after:bg-[0_0,4px_0] after:opacity-5 after:pointer-events-none"
