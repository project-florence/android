import { StatusBar } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import { ThemeProvider } from '@/theme'
import { useThemeStore } from '@/stores/themeStore'
import { themes } from '@/theme/themes'
import { NavigationContainer } from '@/navigation'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 120_000,
    },
  },
})

function AppContent() {
  const themeName = useThemeStore((s) => s.themeName)
  const theme = themes[themeName] || themes.florence
  const isDark = theme.mode === 'dark'

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <NavigationContainer />
      <Toast />
    </>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}
