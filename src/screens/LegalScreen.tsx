import { View, ScrollView, TouchableOpacity } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import { ThemedText, Card } from '@/components'
import api from '@/lib/api'
import type { ProfileStackParamList } from '@/navigation/types'

type LegalRoute = RouteProp<ProfileStackParamList, 'Legal'>

export default function LegalScreen() {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const route = useRoute<LegalRoute>()
  const { policy } = route.params

  const policyLabels: Record<string, string> = {
    terms: t('legal.terms'),
    privacy_policy: t('legal.privacyPolicy'),
    cookie_policy: t('legal.cookiePolicy'),
    disclaimer: t('legal.disclaimer'),
  }

  const { data } = useQuery({
    queryKey: ['legal', policy, i18n.language],
    queryFn: async () => {
      const res = await api.get(`/api/v1/legal?policy=${policy}&lang=${i18n.language}`)
      return res.data as { title?: string; content?: string; last_updated?: string }
    },
  })

  return (
    <View className="flex-1 bg-[#0a0a0f]">
      <View className="pt-12 px-4 pb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <ThemedText className="text-blue-400 text-lg">← {t('common.back')}</ThemedText>
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1 px-4">
        <ThemedText variant="h1" className="mb-2">{policyLabels[policy] || policy}</ThemedText>
        {data?.last_updated && (
          <ThemedText variant="caption" color="muted" className="mb-4">
            {t('legal.lastUpdated')}: {new Date(data.last_updated).toLocaleDateString('tr-TR')}
          </ThemedText>
        )}
        <Card>
          <ThemedText variant="body" color="muted" style={{ lineHeight: 24 }}>
            {data?.content || t('common.loading')}
          </ThemedText>
        </Card>
        <View className="h-8" />
      </ScrollView>
    </View>
  )
}
