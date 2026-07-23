import React, { createContext, useContext, useMemo } from 'react'
import { useThemeStore } from '@/stores/themeStore'
import { themes, type ThemeDefinition, type ThemeName } from './themes'

interface ThemeContextValue {
  theme: ThemeDefinition
  themeName: ThemeName
  isDark: boolean
  colors: ThemeDefinition['colors']
  charts: ThemeDefinition['charts']
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeName = useThemeStore((s) => s.themeName)

  const value = useMemo(() => {
    const theme = themes[themeName] || themes.florence
    return {
      theme,
      themeName: themeName as ThemeName,
      isDark: theme.mode === 'dark',
      colors: theme.colors,
      charts: theme.charts,
    }
  }, [themeName])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
