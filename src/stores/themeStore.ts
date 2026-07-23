import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { themes, type ThemeName } from '@/theme/themes'

interface ThemeState {
  themeName: ThemeName
  applyTheme: (name: ThemeName) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeName: 'florence' as ThemeName,
      applyTheme: (name: ThemeName) => {
        set({ themeName: name })
      },
    }),
    {
      name: 'florence-theme',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
