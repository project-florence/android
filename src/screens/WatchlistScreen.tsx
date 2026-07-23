import { View, FlatList, TouchableOpacity } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ThemedText, Card } from '@/components'
import { useFavorites } from '@/hooks/useFavorites'
import api from '@/lib/api'
import type { CompanySummary } from '@/types/api'

export default function WatchlistScreen() {
  const { t } = useTranslation()
  const { favorites, removeMutation } = useFavorites()

  const { data: companies } = useQuery({
    queryKey: ['watchlist-companies', favorites],
    queryFn: async () => {
      if (!favorites?.length) return []
      const res = await api.get(`/api/v1/companies/summary?limit=${favorites.length}&tickers=${favorites.join(',')}`)
      return res.data.data as CompanySummary[]
    },
    enabled: !!favorites?.length,
  })

  return (
    <View className="flex-1 bg-[#0a0a0f] pt-12 px-4">
      <ThemedText variant="h1" className="mb-6">{t('watchlist.title')}</ThemedText>

      <FlatList
        data={companies || []}
        keyExtractor={(item) => item.ticker}
        renderItem={({ item }) => (
          <Card className="mb-2">
            <View className="flex-row justify-between items-center">
              <View>
                <ThemedText variant="h3">{item.ticker}</ThemedText>
                <ThemedText variant="caption" color="muted">{item.name}</ThemedText>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="items-end">
                  <ThemedText>₺{item.last_price?.toFixed(2) ?? '-'}</ThemedText>
                  <ThemedText style={{ color: (item.change_pct ?? 0) >= 0 ? '#22c55e' : '#ef4444' }}>
                    {item.change_pct != null ? `${item.change_pct >= 0 ? '+' : ''}${item.change_pct.toFixed(2)}%` : '-'}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  onPress={() => removeMutation.mutate(item.ticker)}
                  className="bg-red-600/20 rounded-lg px-3 py-2"
                >
                  <ThemedText className="text-red-400 text-xs">✕</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <ThemedText variant="h3" color="muted" className="text-center">{t('watchlist.empty')}</ThemedText>
          </View>
        }
      />
    </View>
  )
}
