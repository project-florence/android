import { TouchableOpacity } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { ThemedText, Card } from '@/components'
import api from '@/lib/api'
import type { CompanySummary } from '@/types/api'

interface StockCardWidgetProps {
  config?: { ticker?: string }
}

export default function StockCardWidget({ config }: StockCardWidgetProps) {
  const ticker = config?.ticker || 'THYAO'

  const { data } = useQuery({
    queryKey: ['stock-card', ticker],
    queryFn: async () => {
      const res = await api.get(`/api/v1/companies/summary?limit=1&tickers=${ticker}`)
      return (res.data.data as CompanySummary[])[0]
    },
    staleTime: 30_000,
  })

  if (!data) return null

  return (
    <TouchableOpacity className="flex-1">
      <Card>
        <ThemedText variant="h3">{data.ticker}</ThemedText>
        <ThemedText variant="caption" color="muted" numberOfLines={1}>{data.name}</ThemedText>
        <ThemedText variant="h2" className="mt-2">₺{data.last_price?.toFixed(2) ?? '-'}</ThemedText>
        {data.change_pct != null && (
          <ThemedText style={{ color: data.change_pct >= 0 ? '#22c55e' : '#ef4444' }}>
            {data.change_pct >= 0 ? '+' : ''}{data.change_pct.toFixed(2)}%
          </ThemedText>
        )}
      </Card>
    </TouchableOpacity>
  )
}
