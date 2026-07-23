import { View, ScrollView, TouchableOpacity, Linking } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { ThemedText, Card } from '@/components'
import api from '@/lib/api'

export default function ContactScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation()

  const { data } = useQuery({
    queryKey: ['contact'],
    queryFn: async () => {
      const res = await api.get('/api/v1/contact')
      return res.data as { email?: string; github?: string }
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
        <ThemedText variant="h1" className="mb-4">{t('footer.contact')}</ThemedText>

        {data?.email && (
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${data.email}`)}>
            <Card className="mb-3">
              <View className="flex-row items-center gap-3">
                <ThemedText className="text-2xl">📧</ThemedText>
                <View>
                  <ThemedText variant="h3">E-posta</ThemedText>
                  <ThemedText variant="body" color="primary">{data.email}</ThemedText>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}

        {data?.github && (
          <TouchableOpacity onPress={() => Linking.openURL(data.github!)}>
            <Card className="mb-3">
              <View className="flex-row items-center gap-3">
                <ThemedText className="text-2xl">🐙</ThemedText>
                <View>
                  <ThemedText variant="h3">GitHub</ThemedText>
                  <ThemedText variant="body" color="primary">{data.github}</ThemedText>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  )
}
