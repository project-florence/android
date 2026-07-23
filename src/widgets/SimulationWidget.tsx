import { View, TouchableOpacity } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ThemedText, Card } from '@/components'
import api from '@/lib/api'
import type { SimulationResponse } from '@/types/api'

interface SimulationWidgetProps {
  config?: { ticker?: string; days?: number }
}

export default function SimulationWidget({ config }: SimulationWidgetProps) {
  const { t } = useTranslation()
  const ticker = config?.ticker || 'THYAO'
  const days = config?.days || 30

  const { data } = useQuery({
    queryKey: ['simulation-widget', ticker, days],
    queryFn: async () => {
      const res = await api.get<SimulationResponse>(
        `/api/v1/simulations/${ticker}?days=${days}&bounds=1sigma`,
      )
      return res.data
    },
    staleTime: 60_000,
  })

  if (!data) return null

  return (
    <TouchableOpacity className="flex-1">
      <Card>
        <ThemedText variant="h3" className="mb-2">{t('simulation.title')} - {ticker}</ThemedText>
        <View className="flex-row gap-4">
          <View className="flex-1 items-center">
            <ThemedText variant="caption" color="muted">{t('stockDetail.probability')} ↑</ThemedText>
            <ThemedText variant="h2" className="text-green-400">
              {(data.prob_above * 100).toFixed(0)}%
            </ThemedText>
          </View>
          <View className="flex-1 items-center">
            <ThemedText variant="caption" color="muted">{t('stockDetail.probability')} ↓</ThemedText>
            <ThemedText variant="h2" className="text-red-400">
              {(data.prob_below * 100).toFixed(0)}%
            </ThemedText>
          </View>
        </View>
        {data.confidence && (
          <ThemedText variant="caption" color="muted" className="text-center mt-2">
            {t('stockDetail.confidenceInterval')}: ₺{data.confidence.min.toFixed(2)} - ₺{data.confidence.max.toFixed(2)}
          </ThemedText>
        )}
      </Card>
    </TouchableOpacity>
  )
}
