import { View, ScrollView } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ThemedText, Card } from '@/components'
import api from '@/lib/api'

const MAJOR_CURRENCIES = ['USD', 'EUR', 'GBP', 'CHF', 'JPY']

const FLAGS: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', CHF: '🇨🇭', JPY: '🇯🇵',
  AUD: '🇦🇺', CAD: '🇨🇦', DKK: '🇩🇰', NOK: '🇳🇴', SEK: '🇸🇪',
  CNY: '🇨🇳', RUB: '🇷🇺', SAR: '🇸🇦', KWD: '🇰🇼',
}

export default function CurrencyScreen() {
  const { t } = useTranslation()

  const { data } = useQuery({
    queryKey: ['currency-all'],
    queryFn: async () => {
      const res = await api.get<Array<{ Type: string; Buying: string; Selling: string; Change: string }>>('/api/v1/economy/currency')
      return res.data
    },
    staleTime: 30_000,
  })

  const majorRates = data?.filter((c) => MAJOR_CURRENCIES.includes(c.Type)) || []
  const otherRates = data?.filter((c) => !MAJOR_CURRENCIES.includes(c.Type)) || []

  const CurrencyCard = ({ item }: { item: { Type: string; Buying: string; Selling: string; Change: string } }) => {
    const buying = parseFloat(item.Buying?.replace(',', '.') || '0')
    const isPositive = !item.Change?.startsWith('-')
    return (
      <Card className="w-[48%] mb-2">
        <View className="flex-row items-center gap-2 mb-1">
          <ThemedText className="text-lg">{FLAGS[item.Type] || '💱'}</ThemedText>
          <ThemedText variant="h3">{item.Type}</ThemedText>
        </View>
        <ThemedText variant="h2">{buying.toFixed(4)}</ThemedText>
        {item.Change && (
          <ThemedText style={{ color: isPositive ? '#22c55e' : '#ef4444' }}>
            {item.Change}
          </ThemedText>
        )}
      </Card>
    )
  }

  return (
    <ScrollView className="flex-1 bg-[#0a0a0f] pt-12 px-4">
      <ThemedText variant="h1" className="mb-6">{t('nav.currency')}</ThemedText>

      <ThemedText variant="h3" className="mb-3 text-slate-300">Major</ThemedText>
      <View className="flex-row flex-wrap justify-between mb-4">
        {majorRates.map((item) => (
          <CurrencyCard key={item.Type} item={item} />
        ))}
      </View>

      <ThemedText variant="h3" className="mb-3 text-slate-300">Diğer</ThemedText>
      <View className="flex-row flex-wrap justify-between mb-4">
        {otherRates.map((item) => (
          <CurrencyCard key={item.Type} item={item} />
        ))}
      </View>

      <View className="h-8" />
    </ScrollView>
  )
}
