import { NavigationContainer as RNNavigationContainer } from '@react-navigation/native'
import { useAuthStore } from '@/stores/authStore'
import { AuthStack } from './AuthStack'
import { MainTabs } from './MainTabs'

export function NavigationContainer() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <RNNavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </RNNavigationContainer>
  )
}
