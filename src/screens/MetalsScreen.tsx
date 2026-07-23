import { View, ScrollView } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ThemedText, Card } from '@/components'
import api from '@/lib/api'

const GOLD_TYPES = [
  'Ons', 'Gram Altın', 'Çeyrek Altın', 'Yarım Altın', 'Tam Altın',
  'Cumhuriyet Altını', 'Ata Altın', '14 Ayar Altın', '18 Ayar Altın', '22 Ayar Altın',
  'Reşat Altın', 'Hamit Altın', 'İkibuçukluk Altın', 'Gremse Altın',
  'Ziynet Altın', 'Saat Altını',
]

const METAL_EMOJIS: Record<string, string> = {
  'Ons': '🥇', 'Gram Altın': '🪙', 'Çeyrek Altın': '💛', 'Yarım Altın': '💛',
  'Tam Altın': '💛', 'Cumhuriyet Altını': '💛', 'Ata Altın': '💛',
  '14 Ayar Altın': '💛', '18 Ayar Altın': '💛', '22 Ayar Altın': '💛',
  'Reşat Altın': '💛', 'Hamit Altın': '💛', 'İkibuçukluk Altın': '💛',
  'Gremse Altın': '💛', 'Ziynet Altın': '💛', 'Saat Altını': '💛',
}

export default function MetalsScreen() {
  const { t } = useTranslation()

  const { data: goldData } = useQuery({
    queryKey: ['gold-all'],
    queryFn: async () => {
      const res = await api.get<Array<{ Type: string; Buying: string; Selling: string; Change: string }>>('/api/v1/economy/gold-prices')
      return res.data
    },
    staleTime: 30_000,
  })

  const metals = [
    { label: t('metals.gumus'), endpoint: '/api/v1/economy/silver-price', emoji: '🥈' },
    { label: t('metals.gramPalatin'), endpoint: '/api/v1/economy/gram-platinum-price', emoji: '🪙' },
    { label: t('metals.gramPaladyum'), endpoint: '/api/v1/economy/gram-palladium-price', emoji: '🪙' },
  ]

  const OtherMetalCard = ({ label, endpoint, emoji }: { label: string; endpoint: string; emoji: string }) => {
    const { data } = useQuery({
      queryKey: ['metal', endpoint],
      queryFn: async () => {
        const res = await api.get<Array<{ Type: string; Buying: string; Selling: string; Change: string }>>(endpoint)
        return res.data
      },
      staleTime: 30_000,
    })
    const item = data?.[0]
    const buying = item ? parseFloat(item.Buying?.replace(',', '.') || '0') : null
    const isPositive = item?.Change ? !item.Change.startsWith('-') : true
    return (
      <Card className="w-[48%] mb-2">
        <View className="flex-row items-center gap-2 mb-1">
          <ThemedText className="text-lg">{emoji}</ThemedText>
          <ThemedText variant="h3">{label}</ThemedText>
        </View>
        <ThemedText variant="h2">{buying?.toFixed(2) ?? '...'}</ThemedText>
        {item?.Change && (
          <ThemedText style={{ color: isPositive ? '#22c55e' : '#ef4444' }}>{item.Change}</ThemedText>
        )}
      </Card>
    )
  }

  return (
    <ScrollView className="flex-1 bg-[#0a0a0f] pt-12 px-4">
      <ThemedText variant="h1" className="mb-6">{t('nav.metals')}</ThemedText>

      <ThemedText variant="h3" className="mb-3 text-slate-300">{t('dashboard.gold')}</ThemedText>
      <View className="flex-row flex-wrap justify-between mb-4">
        {GOLD_TYPES.map((goldType) => {
          const item = goldData?.find((g) => g.Type === goldType)
          const buying = item ? parseFloat(item.Buying?.replace(',', '.') || '0') : null
          const isPositive = item?.Change ? !item.Change.startsWith('-') : true
          return (
            <Card key={goldType} className="w-[48%] mb-2">
              <View className="flex-row items-center gap-2 mb-1">
                <ThemedText className="text-lg">{METAL_EMOJIS[goldType] || '🪙'}</ThemedText>
                <ThemedText variant="h3" className="text-sm" numberOfLines={1}>{goldType}</ThemedText>
              </View>
              <ThemedText variant="h2">{buying?.toFixed(2) ?? '...'}</ThemedText>
              {item?.Change && (
                <ThemedText style={{ color: isPositive ? '#22c55e' : '#ef4444' }}>{item.Change}</ThemedText>
              )}
            </Card>
          )
        })}
      </View>

      <ThemedText variant="h3" className="mb-3 text-slate-300">Diğer Madenler</ThemedText>
      <View className="flex-row flex-wrap justify-between mb-4">
        {metals.map((m) => (
          <OtherMetalCard key={m.label} label={m.label} endpoint={m.endpoint} emoji={m.emoji} />
        ))}
      </View>

      <View className="h-8" />
    </ScrollView>
  )
}
