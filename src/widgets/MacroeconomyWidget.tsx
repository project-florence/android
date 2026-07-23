import { View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ThemedText, Card } from '@/components'
import api from '@/lib/api'

const macroItems = [
  { key: 'usaGdp', labelKey: 'dashboard.usaGdp', format: 'trillions' },
  { key: 'usaRealGdp', labelKey: 'dashboard.usaRealGdp', format: 'percent' },
  { key: 'usaFedFundsRate', labelKey: 'dashboard.usaFedFundsRate', format: 'percent' },
  { key: 'usaUnemployment', labelKey: 'dashboard.usaUnemployment', format: 'percent' },
  { key: 'usaCpi', labelKey: 'dashboard.usaCpi', format: 'percent' },
  { key: 'usaTenYearTreasury', labelKey: 'dashboard.usaTenYearTreasury', format: 'percent' },
  { key: 'brentOil', labelKey: 'dashboard.brentOil', format: 'price' },
  { key: 'wtiOil', labelKey: 'dashboard.wtiOil', format: 'price' },
  { key: 'dxy', labelKey: 'dashboard.dxy', format: 'index' },
  { key: 'vix', labelKey: 'dashboard.vix', format: 'index' },
  { key: 'usaSp500', labelKey: 'dashboard.usaSp500', format: 'index' },
  { key: 'usaNasdaq', labelKey: 'dashboard.usaNasdaq', format: 'index' },
  { key: 'bitcoin', labelKey: 'dashboard.bitcoin', format: 'price' },
]

export default function MacroeconomyWidget() {
  const { t } = useTranslation()

  const { data } = useQuery({
    queryKey: ['macroeconomy'],
    queryFn: async () => {
      const res = await api.get('/api/v1/macroeconomy')
      return res.data as Record<string, number | string>
    },
    staleTime: 60_000,
  })

  return (
    <Card className="mb-4">
      <ThemedText variant="h3" className="mb-3">{t('dashboard.macroeconomy')}</ThemedText>
      <View className="flex-row flex-wrap">
        {macroItems.map((item) => {
          const value = data?.[item.key]
          let display = '-'
          if (value !== undefined && value !== null) {
            const num = typeof value === 'string' ? parseFloat(value) : value
            if (!isNaN(num)) {
              if (item.format === 'percent') display = `${num.toFixed(2)}%`
              else if (item.format === 'trillions') display = `$${(num / 1e12).toFixed(2)}T`
              else if (item.format === 'price') display = `$${num.toFixed(2)}`
              else display = num.toFixed(2)
            }
          }
          return (
            <View key={item.key} className="w-1/3 p-2">
              <ThemedText variant="caption" color="muted" className="text-xs">{t(item.labelKey as any)}</ThemedText>
              <ThemedText variant="body" className="text-sm">{display}</ThemedText>
            </View>
          )
        })}
      </View>
    </Card>
  )
}
