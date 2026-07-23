import { useQuery } from '@tanstack/react-query'
import { ThemedText, Card } from '@/components'
import api from '@/lib/api'

interface MetalPriceWidgetProps {
  config?: { metal?: string }
}

const metalNames: Record<string, string> = {
  'gram-altin': 'Gram Altın',
  'gumus': 'Gümüş',
  'ons': 'Ons',
  'ceyrek-altin': 'Çeyrek Altın',
}

export default function MetalPriceWidget({ config }: MetalPriceWidgetProps) {
  const metal = config?.metal || 'gram-altin'
  const metalName = metalNames[metal] || metal

  const { data } = useQuery({
    queryKey: ['metal-price', metal],
    queryFn: async () => {
      const res = await api.get('/api/v1/economy/gold-prices')
      return res.data as Array<{ Type: string; Buying: string; Selling: string; Change: string }>
    },
    staleTime: 30_000,
  })

  const item = data?.find((g) => g.Type === metalName)

  return (
    <Card className="flex-1">
      <ThemedText variant="caption" color="muted">{metalName}</ThemedText>
      <ThemedText variant="h2" className="mt-1">
        {item?.Buying ? parseFloat(item.Buying.replace(',', '.')).toFixed(2) : '...'}
      </ThemedText>
      {item?.Change && (
        <ThemedText style={{ color: item.Change.startsWith('-') ? '#ef4444' : '#22c55e' }}>
          {item.Change}
        </ThemedText>
      )}
    </Card>
  )
}
