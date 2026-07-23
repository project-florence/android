import { View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ThemedText, Card } from '@/components'
import { useFavorites } from '@/hooks/useFavorites'
import api from '@/lib/api'
import type { CompanySummary } from '@/types/api'

export default function FavoritesBar() {
  const { t } = useTranslation()
  const { favorites } = useFavorites()

  const { data: companies } = useQuery({
    queryKey: ['favorites-bar', favorites],
    queryFn: async () => {
      if (!favorites?.length) return []
      const res = await api.get(`/api/v1/companies/summary?limit=10&tickers=${favorites.slice(0, 10).join(',')}`)
      return res.data.data as CompanySummary[]
    },
    enabled: !!favorites?.length,
  })

  if (!companies?.length) {
    return (
      <Card className="mb-4">
        <View className="flex-row items-center gap-2 mb-3">
          <ThemedText>⭐</ThemedText>
          <ThemedText variant="h3">{t('watchlist.title')}</ThemedText>
        </View>
        <ThemedText variant="caption" color="muted">{t('watchlist.empty')}</ThemedText>
      </Card>
    )
  }

  return (
    <Card className="mb-4">
      <View className="flex-row items-center gap-2 mb-3">
        <ThemedText>⭐</ThemedText>
        <ThemedText variant="h3">{t('watchlist.title')}</ThemedText>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {companies.slice(0, 10).map((c) => (
          <View key={c.ticker} className="bg-[#0a0a0f] rounded-lg px-3 py-2 flex-1 min-w-[100px]">
            <ThemedText variant="label">{c.ticker}</ThemedText>
            <ThemedText variant="caption" color="muted" numberOfLines={1}>{c.name}</ThemedText>
            <ThemedText style={{ color: (c.change_pct ?? 0) >= 0 ? '#22c55e' : '#ef4444' }}>
              {c.last_price?.toFixed(2) ?? '-'} {c.change_pct != null ? `${c.change_pct >= 0 ? '+' : ''}${c.change_pct.toFixed(1)}%` : ''}
            </ThemedText>
          </View>
        ))}
      </View>
    </Card>
  )
}
