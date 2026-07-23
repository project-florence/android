import { View, useWindowDimensions } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ThemedText, Card } from '@/components'
import api from '@/lib/api'
import type { PriceHistory } from '@/types/api'
import { WebView } from 'react-native-webview'

interface StockChartWidgetProps {
  config?: { ticker?: string }
}

function generateChartHTML(data: PriceHistory[]): string {
  if (!data.length) return '<html><body><p>Veri yok</p></body></html>'

  const candles = JSON.stringify(
    data.map((d) => ({
      time: new Date(d.ts).getTime() / 1000,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    })),
  )

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://unpkg.com/lightweight-charts@4.0.1/dist/lightweight-charts.standalone.production.js"></script>
      <style>
        body { margin: 0; background: #1a1a2e; }
        #chart { width: 100%; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="chart"></div>
      <script>
        const chart = LightweightCharts.createChart(document.getElementById('chart'), {
          width: window.innerWidth,
          height: window.innerHeight,
          layout: { background: { color: '#1a1a2e' }, textColor: '#94a3b8' },
          grid: { vertLines: { color: '#2d2d4a' }, horzLines: { color: '#2d2d4a' } },
          crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
          timeScale: { borderColor: '#2d2d4a' },
          rightPriceScale: { borderColor: '#2d2d4a' },
        });
        const series = chart.addCandlestickSeries({
          upColor: '#22c55e', downColor: '#ef4444',
          borderUpColor: '#22c55e', borderDownColor: '#ef4444',
          wickUpColor: '#22c55e', wickDownColor: '#ef4444',
        });
        series.setData(${candles});
        chart.timeScale().fitContent();
      </script>
    </body>
    </html>
  `
}

export default function StockChartWidget({ config }: StockChartWidgetProps) {
  const { t } = useTranslation()
  const ticker = config?.ticker || 'THYAO'
  const { width } = useWindowDimensions()

  const { data } = useQuery({
    queryKey: ['stock-chart', ticker],
    queryFn: async () => {
      const res = await api.get<PriceHistory[]>(`/api/v1/price/history/${ticker}?period=1y&interval=1d`)
      return res.data
    },
    staleTime: 60_000,
  })

  return (
    <Card className="mb-4">
      <ThemedText variant="h3" className="mb-2">{t('stockDetail.chart')} - {ticker}</ThemedText>
      {data?.length ? (
        <View className="h-48 rounded-lg overflow-hidden">
          <WebView
            source={{ html: generateChartHTML(data) }}
            style={{ backgroundColor: '#1a1a2e' }}
            scrollEnabled={false}
          />
        </View>
      ) : (
        <View className="h-48 items-center justify-center bg-[#0a0a0f] rounded-lg">
          <ThemedText color="muted">{t('common.loading')}</ThemedText>
        </View>
      )}
    </Card>
  )
}
