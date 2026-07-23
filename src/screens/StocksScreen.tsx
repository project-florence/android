import { useState, useCallback } from 'react'
import { View, TextInput, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import { ThemedText, Card } from '@/components'
import type { CompanySummary, CompanySummaryResponse } from '@/types/api'

function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return '-'
  return price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatChange(change: number | null): { text: string; color: string } {
  if (change === null || change === undefined) return { text: '-', color: '#94a3b8' }
  const sign = change >= 0 ? '+' : ''
  const color = change > 0 ? '#22c55e' : change < 0 ? '#ef4444' : '#94a3b8'
  return { text: `${sign}${change.toFixed(2)}%`, color }
}

export default function StocksScreen() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 50

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['companies', page],
    queryFn: async () => {
      const res = await api.get<CompanySummaryResponse>(
        `/api/v1/companies/summary?limit=${pageSize}&offset=${page * pageSize}&sort=popular`,
      )
      return res.data
    },
  })

  const filtered = search
    ? data?.data.filter(
        (c) =>
          c.ticker.toLowerCase().includes(search.toLowerCase()) ||
          c.name?.toLowerCase().includes(search.toLowerCase()),
      )
    : data?.data

  const renderItem = useCallback(
    ({ item }: { item: CompanySummary }) => (
      <TouchableOpacity>
        <Card className="mb-2">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <ThemedText variant="h3">{item.ticker}</ThemedText>
              <ThemedText variant="caption" color="muted" numberOfLines={1}>{item.name}</ThemedText>
            </View>
            <View className="items-end">
              <ThemedText>₺{formatPrice(item.last_price)}</ThemedText>
              <ThemedText style={{ color: formatChange(item.change_pct).color }}>
                {formatChange(item.change_pct).text}
              </ThemedText>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    ),
    [],
  )

  return (
    <View className="flex-1 bg-[#0a0a0f] pt-12 px-4">
      <ThemedText variant="h1" className="mb-4">{t('stocks.title')}</ThemedText>

      <TextInput
        className="bg-[#1a1a2e] text-white border border-[#2d2d4a] rounded-lg px-4 py-3 mb-4"
        placeholder={t('stocks.search')}
        placeholderTextColor="#64748b"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filtered || []}
        keyExtractor={(item) => item.ticker}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#2563eb" />}
        onEndReached={() => {
          if (data && (page + 1) * pageSize < data.total) {
            setPage((p) => p + 1)
          }
        }}
        ListEmptyComponent={
          <View className="items-center py-8">
            <ThemedText color="muted">{isLoading ? t('common.loading') : t('common.noData')}</ThemedText>
          </View>
        }
      />
    </View>
  )
}
