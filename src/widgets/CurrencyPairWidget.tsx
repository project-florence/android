import { useQuery } from '@tanstack/react-query'
import { ThemedText, Card } from '@/components'
import api from '@/lib/api'

interface CurrencyPairWidgetProps {
  config?: { code?: string }
}

export default function CurrencyPairWidget({ config }: CurrencyPairWidgetProps) {
  const code = config?.code || 'USD'

  const { data } = useQuery({
    queryKey: ['currency-pair', code],
    queryFn: async () => {
      const res = await api.get('/api/v1/economy/currency')
      return res.data as Array<{ Type: string; Buying: string; Selling: string; Change: string }>
    },
    staleTime: 30_000,
  })

  const item = data?.find((c) => c.Type === code)

  return (
    <Card className="flex-1">
      <ThemedText variant="caption" color="muted">{code}</ThemedText>
      <ThemedText variant="h2" className="mt-1">
        {item?.Buying ? parseFloat(item.Buying.replace(',', '.')).toFixed(4) : '...'}
      </ThemedText>
      {item?.Change && (
        <ThemedText style={{ color: item.Change.startsWith('-') ? '#ef4444' : '#22c55e' }}>
          {item.Change}
        </ThemedText>
      )}
    </Card>
  )
}
