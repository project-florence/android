import { useState } from 'react'
import { View, ScrollView, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ThemedText, Card, Button } from '@/components'
import { useAuthStore } from '@/stores/authStore'
import { useCredits } from '@/hooks/useCredits'
import { useThemeStore } from '@/stores/themeStore'
import api from '@/lib/api'
import type { Profile } from '@/types/api'
import type { ThemeName } from '@/theme/themes'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { ProfileStackParamList } from '@/navigation/types'

const themeSwatches: { name: ThemeName; colors: string[] }[] = [
  { name: 'florence', colors: ['#2563eb', '#f59e0b', '#1a1a2e'] },
  { name: 'ocean', colors: ['#06b6d4', '#2dd4bf', '#0f1a2e'] },
  { name: 'emerald', colors: ['#10b981', '#34d399', '#0f1a1a'] },
  { name: 'midnight', colors: ['#8b5cf6', '#a78bfa', '#0f0a1a'] },
  { name: 'sunset', colors: ['#f59e0b', '#fb923c', '#1a1a0f'] },
  { name: 'light', colors: ['#2563eb', '#f59e0b', '#ffffff'] },
]

export default function ProfileScreen() {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>()
  const logout = useAuthStore((s) => s.logout)
  const { balance } = useCredits()
  const themeName = useThemeStore((s) => s.themeName)
  const applyTheme = useThemeStore((s) => s.applyTheme)
  const [activeTab, setActiveTab] = useState<'account' | 'settings'>('account')

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get<Profile>('/api/v1/profile')
      return res.data
    },
  })

  const switchLanguage = () => {
    i18n.changeLanguage(i18n.language === 'tr' ? 'en' : 'tr')
  }

  return (
    <ScrollView className="flex-1 bg-[#0a0a0f] pt-12 px-4">
      <ThemedText variant="h1" className="mb-6">{t('profile.title')}</ThemedText>

      <Card className="mb-4">
        <View className="flex-row items-center gap-4">
          <View className="w-14 h-14 bg-blue-600 rounded-full items-center justify-center">
            <ThemedText className="text-2xl font-bold">{profile?.username?.[0]?.toUpperCase() || '?'}</ThemedText>
          </View>
          <View className="flex-1">
            <ThemedText variant="h3">{profile?.username || '-'}</ThemedText>
            <ThemedText variant="caption" color="muted">{profile?.email || '-'}</ThemedText>
          </View>
          <View className="items-end">
            <ThemedText variant="caption" color="muted">{t('profile.credits')}</ThemedText>
            <ThemedText variant="h3" color="primary">{balance ?? '...'} 🪙</ThemedText>
          </View>
        </View>
      </Card>

      <Card className="mb-4">
        <TouchableOpacity className="py-3 border-b border-[#2d2d4a]" onPress={() => navigation.navigate('Advisor')}>
          <View className="flex-row items-center gap-3"><ThemedText className="text-xl">📋</ThemedText><ThemedText variant="h3">{t('nav.scout')}</ThemedText></View>
        </TouchableOpacity>
        <TouchableOpacity className="py-3 border-b border-[#2d2d4a]" onPress={() => navigation.navigate('Reports')}>
          <View className="flex-row items-center gap-3"><ThemedText className="text-xl">📄</ThemedText><ThemedText variant="h3">{t('nav.reports')}</ThemedText></View>
        </TouchableOpacity>
        <TouchableOpacity className="py-3 border-b border-[#2d2d4a]" onPress={() => navigation.navigate('IPOs')}>
          <View className="flex-row items-center gap-3"><ThemedText className="text-xl">🏢</ThemedText><ThemedText variant="h3">{t('nav.ipos')}</ThemedText></View>
        </TouchableOpacity>
        <TouchableOpacity className="py-3 border-b border-[#2d2d4a]" onPress={() => navigation.navigate('Currency')}>
          <View className="flex-row items-center gap-3"><ThemedText className="text-xl">💱</ThemedText><ThemedText variant="h3">{t('nav.currency')}</ThemedText></View>
        </TouchableOpacity>
        <TouchableOpacity className="py-3 border-b border-[#2d2d4a]" onPress={() => navigation.navigate('Metals')}>
          <View className="flex-row items-center gap-3"><ThemedText className="text-xl">🥇</ThemedText><ThemedText variant="h3">{t('nav.metals')}</ThemedText></View>
        </TouchableOpacity>
        <TouchableOpacity className="py-3 border-b border-[#2d2d4a]" onPress={() => navigation.navigate('About')}>
          <View className="flex-row items-center gap-3"><ThemedText className="text-xl">ℹ️</ThemedText><ThemedText variant="h3">{t('footer.about')}</ThemedText></View>
        </TouchableOpacity>
        <TouchableOpacity className="py-3 border-b border-[#2d2d4a]" onPress={() => navigation.navigate('Contact')}>
          <View className="flex-row items-center gap-3"><ThemedText className="text-xl">📧</ThemedText><ThemedText variant="h3">{t('footer.contact')}</ThemedText></View>
        </TouchableOpacity>
        <TouchableOpacity className="py-3" onPress={() => navigation.navigate('Legal', { policy: 'terms' })}>
          <View className="flex-row items-center gap-3"><ThemedText className="text-xl">⚖️</ThemedText><ThemedText variant="h3">{t('footer.terms')}</ThemedText></View>
        </TouchableOpacity>
      </Card>

      <View className="flex-row mb-4 bg-[#1a1a2e] rounded-xl p-1">
        {(['account', 'settings'] as const).map((tabName) => (
          <TouchableOpacity
            key={tabName}
            className={`flex-1 py-2 rounded-lg items-center ${activeTab === tabName ? 'bg-blue-600' : ''}`}
            onPress={() => setActiveTab(tabName)}
          >
            <ThemedText variant="label" color={activeTab === tabName ? 'default' : 'muted'}>
              {tabName === 'account' ? t('profile.account') : t('profile.settings')}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'account' ? (
        <Card className="mb-4">
          <ThemedText className="mb-3" variant="h3">{t('profile.account')}</ThemedText>
          <ThemedText variant="label" color="muted" className="mb-1">{t('profile.username')}</ThemedText>
          <ThemedText className="mb-3">{profile?.username || '-'}</ThemedText>
          <ThemedText variant="label" color="muted" className="mb-1">{t('profile.email')}</ThemedText>
          <ThemedText className="mb-4">{profile?.email || '-'}</ThemedText>
          <Button variant="destructive" onPress={logout}>
            {t('nav.logout')}
          </Button>
        </Card>
      ) : (
        <>
          <Card className="mb-4">
            <ThemedText variant="h3" className="mb-4">{t('customization.theme')}</ThemedText>
            <View className="flex-row flex-wrap gap-3">
              {themeSwatches.map(({ name, colors }) => (
                <TouchableOpacity
                  key={name}
                  className={`p-2 rounded-xl border-2 ${themeName === name ? 'border-blue-500' : 'border-transparent'}`}
                  onPress={() => applyTheme(name)}
                >
                  <View className="flex-row gap-1">
                    {colors.map((c, i) => (
                      <View key={i} className="w-6 h-6 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </View>
                  <ThemedText variant="caption" className="text-center mt-1 capitalize">{name}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card className="mb-4">
            <ThemedText variant="h3" className="mb-3">{t('profile.language')}</ThemedText>
            <Button variant="outline" onPress={switchLanguage}>
              {i18n.language === 'tr' ? 'Türkçe → English' : 'English → Türkçe'}
            </Button>
          </Card>
        </>
      )}

      <View className="h-8" />
    </ScrollView>
  )
}
