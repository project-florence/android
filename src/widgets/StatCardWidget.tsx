import { View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ThemedText, Card } from '@/components'
import api from '@/lib/api'

interface StatCardWidgetProps {
  config?: { titleKey?: string; dataSource?: string; pair?: string }
}

function formatPrice(price: string | number | undefined | null): string {
  if (price === undefined || price === null) return 'Yükleniyor...'
  const num = typeof price === 'string' ? parseFloat(price.replace(',', '.')) : price
  if (isNaN(num)) return '-'
  return num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

export default function StatCardWidget({ config }: StatCardWidgetProps) {
  const { t } = useTranslation()
  const titleKey = config?.titleKey || 'dashboard.gold'
  const dataSource = config?.dataSource || 'gold'
  const pair = config?.pair || ''

  const { data: goldData } = useQuery({
    queryKey: ['gold-prices'],
    queryFn: async () => {
      const res = await api.get('/api/v1/economy/gold-prices')
      return res.data as Array<{ Type: string; Buying: string; Selling: string; Change: string }>
    },
    enabled: dataSource === 'gold',
    staleTime: 30_000,
  })

  const { data: currencyData } = useQuery({
    queryKey: ['currency-rates'],
    queryFn: async () => {
      const res = await api.get('/api/v1/economy/currency')
      return res.data as Array<{ Type: string; Buying: string; Selling: string; Change: string }>
    },
    enabled: dataSource === 'currency',
    staleTime: 30_000,
  })

  const item = dataSource === 'gold'
    ? goldData?.find((g) => g.Type === 'Gram Altın')
    : currencyData?.find((c) => c.Type === pair)

  const buying = item ? formatPrice(item.Buying) : 'Yükleniyor...'
  const changeStr = item?.Change || ''
  const isPositive = !changeStr.includes('-')
  const changeColor = changeStr ? (isPositive ? '#22c55e' : '#ef4444') : '#94a3b8'

  return (
    <Card className="flex-1">
      <ThemedText variant="caption" color="muted">{t(titleKey as any)}</ThemedText>
      <ThemedText variant="h2" className="mt-1">{buying}</ThemedText>
      {changeStr ? (
        <ThemedText style={{ color: changeColor }}>
          {changeStr.replace(',', '.')}
        </ThemedText>
      ) : null}
    </Card>
  )
}
