import { useState } from 'react'
import { View, ScrollView, TextInput, TouchableOpacity } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ThemedText, Card, Button } from '@/components'
import api from '@/lib/api'
import type { SimulationResponse, SimulationHistoryItem, SimulationHistoryDetail, PerDayCostResponse } from '@/types/api'

const CONFIDENCE_OPTIONS = [
  { label: '90%', value: '1sigma', bounds: 0.05 },
  { label: '95%', value: '2sigma', bounds: 0.025 },
  { label: '99%', value: '3sigma', bounds: 0.005 },
]

export default function SimulationScreen() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'simulate' | 'history'>('simulate')
  const [ticker, setTicker] = useState('THYAO')
  const [days, setDays] = useState('30')
  const [target, setTarget] = useState('')
  const [confidence, setConfidence] = useState(CONFIDENCE_OPTIONS[0])
  const [searchTicker, setSearchTicker] = useState('')

  const { data: result, isLoading: simLoading, refetch: runSim } = useQuery({
    queryKey: ['simulation', ticker, days, target, confidence],
    queryFn: async () => {
      const params = `/api/v1/simulations/${ticker}?days=${days}&bounds=${confidence.value}${target ? `&target=${target}` : ''}`
      const res = await api.get<SimulationResponse>(params)
      return res.data
    },
    enabled: false,
  })

  const { data: perDayCost } = useQuery({
    queryKey: ['per-day-cost'],
    queryFn: async () => {
      const res = await api.get<PerDayCostResponse>('/api/v1/simulations/per-day-cost')
      return res.data
    },
  })

  const { data: history } = useQuery({
    queryKey: ['simulation-history'],
    queryFn: async () => {
      const res = await api.get<SimulationHistoryItem[]>('/api/v1/simulations/history')
      return res.data
    },
    enabled: activeTab === 'history',
  })

  const [selectedHistory, setSelectedHistory] = useState<number | null>(null)
  const { data: historyDetail } = useQuery({
    queryKey: ['simulation-history-detail', selectedHistory],
    queryFn: async () => {
      const res = await api.get<SimulationHistoryDetail>(`/api/v1/simulations/history/${selectedHistory}`)
      return res.data
    },
    enabled: selectedHistory !== null,
  })

  const quickTargets = [10, 20, 30]
  const estimatedCost = perDayCost ? Math.round(parseInt(days || '0') * perDayCost.per_day_cost * 100) / 100 : null

  return (
    <View className="flex-1 bg-[#0a0a0f] pt-12 px-4">
      <ThemedText variant="h1" className="mb-6">{t('simulation.title')}</ThemedText>

      <View className="flex-row mb-4 bg-[#1a1a2e] rounded-xl p-1">
        {(['simulate', 'history'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-2 rounded-lg items-center ${activeTab === tab ? 'bg-blue-600' : ''}`}
            onPress={() => setActiveTab(tab)}
          >
            <ThemedText variant="label" color={activeTab === tab ? 'default' : 'muted'}>
              {tab === 'simulate' ? t('simulation.calculate') : t('reports.history')}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'simulate' ? (
        <ScrollView>
          <Card className="mb-4">
            <ThemedText variant="label" color="muted" className="mb-2">Hisse Senedi</ThemedText>
            <TextInput
              className="bg-[#0a0a0f] text-white border border-[#2d2d4a] rounded-lg px-4 py-3 mb-4"
              value={ticker}
              onChangeText={setTicker}
              placeholder="THYAO"
              placeholderTextColor="#64748b"
              autoCapitalize="characters"
            />

            <ThemedText variant="label" color="muted" className="mb-2">Gün ({days})</ThemedText>
            <View className="flex-row gap-2 mb-4">
              {[7, 30, 90, 180, 365].map((d) => (
                <TouchableOpacity
                  key={d}
                  className={`px-4 py-2 rounded-lg ${parseInt(days) === d ? 'bg-blue-600' : 'bg-[#0a0a0f] border border-[#2d2d4a]'}`}
                  onPress={() => setDays(d.toString())}
                >
                  <ThemedText variant="caption">{d}g</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText variant="label" color="muted" className="mb-2">{t('stockDetail.chart')} Hedef Fiyat</ThemedText>
            <TextInput
              className="bg-[#0a0a0f] text-white border border-[#2d2d4a] rounded-lg px-4 py-3 mb-2"
              value={target}
              onChangeText={setTarget}
              placeholder="Opsiyonel"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
            />
            <View className="flex-row gap-2 mb-4">
              {quickTargets.map((pct) => (
                <TouchableOpacity
                  key={pct}
                  className="bg-[#0a0a0f] border border-[#2d2d4a] rounded-lg px-3 py-2"
                  onPress={() => setTarget(pct.toString())}
                >
                  <ThemedText variant="caption">±%{pct}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText variant="label" color="muted" className="mb-2">Güven Aralığı</ThemedText>
            <View className="flex-row gap-2 mb-4">
              {CONFIDENCE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  className={`flex-1 py-2 rounded-lg items-center ${confidence.value === opt.value ? 'bg-blue-600' : 'bg-[#0a0a0f] border border-[#2d2d4a]'}`}
                  onPress={() => setConfidence(opt)}
                >
                  <ThemedText variant="caption">{opt.label}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {estimatedCost != null && (
              <ThemedText variant="caption" color="muted" className="mb-4">
                Tahmini Maliyet: ~{estimatedCost} 🪙
              </ThemedText>
            )}

            <Button onPress={() => runSim()} loading={simLoading}>
              {t('simulation.calculate')}
            </Button>
          </Card>

          {result && (
            <Card className="mb-4">
              <ThemedText variant="h3" className="mb-3">Sonuçlar - {result.ticker}</ThemedText>
              <View className="flex-row gap-4 mb-3">
                <View className="flex-1 items-center bg-green-600/20 rounded-xl py-3">
                  <ThemedText variant="caption" color="muted">Yükselme ↑</ThemedText>
                  <ThemedText variant="h2" className="text-green-400">{(result.prob_above * 100).toFixed(1)}%</ThemedText>
                </View>
                <View className="flex-1 items-center bg-red-600/20 rounded-xl py-3">
                  <ThemedText variant="caption" color="muted">Düşüş ↓</ThemedText>
                  <ThemedText variant="h2" className="text-red-400">{(result.prob_below * 100).toFixed(1)}%</ThemedText>
                </View>
              </View>
              {result.confidence && (
                <>
                  <ThemedText variant="label" color="muted" className="mb-1">Güven Aralığı (%{(result.confidence.percent * 100).toFixed(0)})</ThemedText>
                  <ThemedText>₺{result.confidence.min.toFixed(2)} - ₺{result.confidence.max.toFixed(2)}</ThemedText>
                </>
              )}
              <View className="flex-row justify-between mt-3 pt-3 border-t border-[#2d2d4a]">
                <ThemedText variant="caption" color="muted">Harcanan: {result.credits_spend} 🪙</ThemedText>
                <ThemedText variant="caption" color="muted">Kalan: {result.remaining_credits} 🪙</ThemedText>
              </View>
            </Card>
          )}

          <View className="h-8" />
        </ScrollView>
      ) : (
        <ScrollView>
          {history?.length ? history.map((item) => (
            <TouchableOpacity key={item.id} onPress={() => setSelectedHistory(selectedHistory === item.id ? null : item.id)}>
              <Card className="mb-2">
                <View className="flex-row justify-between">
                  <View>
                    <ThemedText variant="h3">{item.ticker}</ThemedText>
                    <ThemedText variant="caption" color="muted">{item.days}g • {new Date(item.created_at).toLocaleDateString('tr-TR')}</ThemedText>
                  </View>
                  <ThemedText variant="caption" color="muted">{item.cost} 🪙</ThemedText>
                </View>
                {selectedHistory === item.id && historyDetail?.result && (
                  <View className="mt-3 pt-3 border-t border-[#2d2d4a]">
                    <View className="flex-row gap-3">
                      <View className="flex-1 items-center">
                        <ThemedText variant="caption" color="muted">↑</ThemedText>
                        <ThemedText className="text-green-400">{(historyDetail.result.prob_above * 100).toFixed(1)}%</ThemedText>
                      </View>
                      <View className="flex-1 items-center">
                        <ThemedText variant="caption" color="muted">↓</ThemedText>
                        <ThemedText className="text-red-400">{(historyDetail.result.prob_below * 100).toFixed(1)}%</ThemedText>
                      </View>
                    </View>
                    {historyDetail.result.confidence && (
                      <ThemedText variant="caption" color="muted" className="text-center mt-2">
                        GA ({(historyDetail.result.confidence.percent * 100).toFixed(0)}%): ₺{historyDetail.result.confidence.min.toFixed(2)} - ₺{historyDetail.result.confidence.max.toFixed(2)}
                      </ThemedText>
                    )}
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          )) : (
            <ThemedText color="muted" className="text-center py-8">{t('common.loading')}</ThemedText>
          )}
          <View className="h-8" />
        </ScrollView>
      )}
    </View>
  )
}
