import { useState } from 'react'
import { View, ScrollView, TextInput, TouchableOpacity } from 'react-native'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ThemedText, Card, Button } from '@/components'
import api from '@/lib/api'
import type { StockFitResponse, PortfolioProfileResponse } from '@/types/api'

const HORIZONS = [
  { key: 'short', labelKey: 'scout.shortTerm', value: 0.2 },
  { key: 'medium', labelKey: 'scout.mediumTerm', value: 0.5 },
  { key: 'long', labelKey: 'scout.longTerm', value: 0.8 },
]

const PROFITABILITIES = [
  { key: 'low', labelKey: 'scout.profitLow', value: 0.2 },
  { key: 'medium', labelKey: 'scout.profitMedium', value: 0.5 },
  { key: 'high', labelKey: 'scout.profitHigh', value: 0.8 },
]

const RISKS = [
  { key: 'low', labelKey: 'scout.low', value: 0.2 },
  { key: 'medium', labelKey: 'scout.medium', value: 0.5 },
  { key: 'high', labelKey: 'scout.high', value: 0.8 },
]

export default function AdvisorScreen() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'fit' | 'portfolio'>('fit')
  const [horizon, setHorizon] = useState(HORIZONS[0])
  const [profitability, setProfitability] = useState(PROFITABILITIES[0])
  const [risk, setRisk] = useState(RISKS[0])
  const [portfolioTickers, setPortfolioTickers] = useState<string[]>([])
  const [inputTicker, setInputTicker] = useState('')

  const fitMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<StockFitResponse>('/api/v1/stocks/fit', {
        horizon_target: horizon.value,
        profitability_target: profitability.value,
        risk_tolerance: risk.value,
      })
      return res.data
    },
  })

  const portfolioMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<PortfolioProfileResponse>('/api/v1/portfolio/profile', {
        tickers: portfolioTickers,
      })
      return res.data
    },
  })

  const addTicker = () => {
    const t = inputTicker.trim().toUpperCase()
    if (t && !portfolioTickers.includes(t)) {
      setPortfolioTickers([...portfolioTickers, t])
      setInputTicker('')
    }
  }

  const removeTicker = (ticker: string) => {
    setPortfolioTickers(portfolioTickers.filter((t) => t !== ticker))
  }

  return (
    <View className="flex-1 bg-[#0a0a0f] pt-12 px-4">
      <ThemedText variant="h1" className="mb-6">{t('scout.title')}</ThemedText>

      <View className="flex-row mb-4 bg-[#1a1a2e] rounded-xl p-1">
        <TouchableOpacity
          className={`flex-1 py-2 rounded-lg items-center ${mode === 'fit' ? 'bg-blue-600' : ''}`}
          onPress={() => setMode('fit')}
        >
          <ThemedText variant="label" color={mode === 'fit' ? 'default' : 'muted'}>{t('scout.stockFit')}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2 rounded-lg items-center ${mode === 'portfolio' ? 'bg-blue-600' : ''}`}
          onPress={() => setMode('portfolio')}
        >
          <ThemedText variant="label" color={mode === 'portfolio' ? 'default' : 'muted'}>{t('scout.portfolio')}</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {mode === 'fit' ? (
          <Card className="mb-4">
            <ThemedText variant="label" color="muted" className="mb-3">{t('scout.horizon')}</ThemedText>
            <View className="flex-row gap-2 mb-4">
              {HORIZONS.map((h) => (
                <TouchableOpacity
                  key={h.key}
                  className={`flex-1 py-3 rounded-lg items-center ${horizon.key === h.key ? 'bg-blue-600' : 'bg-[#0a0a0f] border border-[#2d2d4a]'}`}
                  onPress={() => setHorizon(h)}
                >
                  <ThemedText variant="caption">{t(h.labelKey as any)}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText variant="label" color="muted" className="mb-3">{t('scout.profitability')}</ThemedText>
            <View className="flex-row gap-2 mb-4">
              {PROFITABILITIES.map((p) => (
                <TouchableOpacity
                  key={p.key}
                  className={`flex-1 py-3 rounded-lg items-center ${profitability.key === p.key ? 'bg-blue-600' : 'bg-[#0a0a0f] border border-[#2d2d4a]'}`}
                  onPress={() => setProfitability(p)}
                >
                  <ThemedText variant="caption">{t(p.labelKey as any)}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText variant="label" color="muted" className="mb-3">{t('scout.riskTolerance')}</ThemedText>
            <View className="flex-row gap-2 mb-4">
              {RISKS.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  className={`flex-1 py-3 rounded-lg items-center ${risk.key === r.key ? 'bg-blue-600' : 'bg-[#0a0a0f] border border-[#2d2d4a]'}`}
                  onPress={() => setRisk(r)}
                >
                  <ThemedText variant="caption">{t(r.labelKey as any)}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <Button onPress={() => fitMutation.mutate()} loading={fitMutation.isPending}>
              {t('scout.analyze')}
            </Button>
          </Card>
        ) : (
          <Card className="mb-4">
            <ThemedText variant="h3" className="mb-3">{t('scout.portfolio')}</ThemedText>
            <ThemedText variant="caption" color="muted" className="mb-3">{t('scout.portfolioDesc')}</ThemedText>

            <View className="flex-row gap-2 mb-3">
              <TextInput
                className="flex-1 bg-[#0a0a0f] text-white border border-[#2d2d4a] rounded-lg px-4 py-3"
                value={inputTicker}
                onChangeText={setInputTicker}
                placeholder={t('scout.addTicker')}
                placeholderTextColor="#64748b"
                autoCapitalize="characters"
              />
              <TouchableOpacity className="bg-blue-600 px-4 rounded-lg items-center justify-center" onPress={addTicker}>
                <ThemedText>+</ThemedText>
              </TouchableOpacity>
            </View>

            {portfolioTickers.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-4">
                {portfolioTickers.map((t) => (
                  <TouchableOpacity key={t} className="bg-blue-600/20 rounded-full px-3 py-1 flex-row items-center gap-2" onPress={() => removeTicker(t)}>
                    <ThemedText>{t}</ThemedText>
                    <ThemedText className="text-red-400">✕</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Button onPress={() => portfolioMutation.mutate()} loading={portfolioMutation.isPending} disabled={portfolioTickers.length === 0}>
              {t('scout.analyze')}
            </Button>
          </Card>
        )}

        {fitMutation.data && (
          <Card className="mb-4">
            <ThemedText variant="h3" className="mb-3">{t('scout.results')}</ThemedText>
            {fitMutation.data.results.slice(0, 10).map((item, i) => (
              <View key={item.ticker} className="flex-row items-center py-2 border-b border-[#2d2d4a] last:border-b-0">
                <ThemedText variant="caption" color="muted" className="w-6">#{i + 1}</ThemedText>
                <View className="flex-1">
                  <ThemedText variant="h3">{item.ticker}</ThemedText>
                  <View className="flex-row gap-1 mt-1">
                    <View className="h-1.5 rounded-full bg-blue-600" style={{ width: `${item.vector[0] * 100}%` }} />
                    <View className="h-1.5 rounded-full bg-green-600" style={{ width: `${item.vector[1] * 100}%` }} />
                    <View className="h-1.5 rounded-full bg-amber-600" style={{ width: `${item.vector[2] * 100}%` }} />
                  </View>
                </View>
                <View className="items-end">
                  <ThemedText color="primary">{(item.score * 100).toFixed(0)}%</ThemedText>
                  <ThemedText variant="caption" color="muted">{t('scout.score')}</ThemedText>
                </View>
              </View>
            ))}
          </Card>
        )}

        {portfolioMutation.data && (
          <>
            {portfolioMutation.data.estimated_profile && (
              <Card className="mb-4">
                <ThemedText variant="h3" className="mb-3">{t('scout.estimatedProfile')}</ThemedText>
                <View className="flex-row gap-2">
                  {Object.entries(portfolioMutation.data.estimated_profile).map(([key, val]) => (
                    <View key={key} className="flex-1 bg-[#0a0a0f] rounded-lg p-3 items-center">
                      <ThemedText variant="caption" color="muted" className="capitalize">{key}</ThemedText>
                      <ThemedText className="capitalize">{val}</ThemedText>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {portfolioMutation.data.similar_stocks?.length > 0 && (
              <Card className="mb-4">
                <ThemedText variant="h3" className="mb-3">{t('scout.similarStocks')}</ThemedText>
                {portfolioMutation.data.similar_stocks.slice(0, 5).map((item) => (
                  <View key={item.ticker} className="flex-row items-center py-2 border-b border-[#2d2d4a] last:border-b-0">
                    <ThemedText variant="h3" className="flex-1">{item.ticker}</ThemedText>
                    <ThemedText color="primary">{(item.score * 100).toFixed(0)}%</ThemedText>
                  </View>
                ))}
              </Card>
            )}
          </>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  )
}
