import { View, ScrollView, TouchableOpacity } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { ThemedText, Card } from '@/components'
import api from '@/lib/api'

export default function AboutScreen() {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  const { data } = useQuery({
    queryKey: ['about', i18n.language],
    queryFn: async () => {
      const res = await api.get(`/api/v1/about?lang=${i18n.language}`)
      return res.data as string
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
        <ThemedText variant="h1" className="mb-4">{t('footer.about')}</ThemedText>
        <Card>
          <ThemedText variant="body" color="muted" style={{ lineHeight: 24 }}>
            {data || t('common.loading')}
          </ThemedText>
        </Card>
        <View className="h-8" />
      </ScrollView>
    </View>
  )
}
