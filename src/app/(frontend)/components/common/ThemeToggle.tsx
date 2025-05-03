import React from 'react'
import { useTheme } from 'next-themes'
import styles from './theme-toggle.module.css'
import { FaSun, FaMoon } from 'react-icons/fa'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggleTheme}
      className={styles.themeToggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <FaMoon className={styles.icon} /> : <FaSun className={styles.icon} />}
    </button>
  )
}

export default ThemeToggle
