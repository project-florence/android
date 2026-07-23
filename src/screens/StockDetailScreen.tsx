import { useState } from 'react'
import { View, ScrollView, TouchableOpacity, Linking, useWindowDimensions } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import { ThemedText, Card, Button, Badge } from '@/components'
import api from '@/lib/api'
import type { CompanyInfo, PriceHistory, NewsItem } from '@/types/api'
import { useFavorites } from '@/hooks/useFavorites'
import { WebView } from 'react-native-webview'
import type { StocksStackParamList } from '@/navigation/types'

type StockDetailRoute = RouteProp<StocksStackParamList, 'StockDetail'>

function formatNum(n: number | null | undefined, decimals = 2): string {
  if (n == null || isNaN(n)) return '-'
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(2)}T`
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(2)}K`
  return n.toFixed(decimals)
}

function formatPct(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '-'
  return `${(n * 100).toFixed(2)}%`
}

function generateChartHTML(data: PriceHistory[]): string {
  const candles = JSON.stringify(
    data.map((d) => ({
      time: new Date(d.ts).getTime() / 1000,
      open: d.open, high: d.high, low: d.low, close: d.close,
    })),
  )
  return `
    <!DOCTYPE html>
    <html><head>
    <script src="https://unpkg.com/lightweight-charts@4.0.1/dist/lightweight-charts.standalone.production.js"></script>
    <style>body{margin:0;background:#1a1a2e;}#chart{width:100%;height:100vh;}</style>
    </head><body>
    <div id="chart"></div>
    <script>
    const chart=LightweightCharts.createChart(document.getElementById('chart'),{
      width:window.innerWidth,height:window.innerHeight,
      layout:{background:{color:'#1a1a2e'},textColor:'#94a3b8'},
      grid:{vertLines:{color:'#2d2d4a'},horzLines:{color:'#2d2d4a'}},
      timeScale:{borderColor:'#2d2d4a'},rightPriceScale:{borderColor:'#2d2d4a'}
    });
    const series=chart.addCandlestickSeries({
      upColor:'#22c55e',downColor:'#ef4444',
      borderUpColor:'#22c55e',borderDownColor:'#ef4444',
      wickUpColor:'#22c55e',wickDownColor:'#ef4444'
    });
    series.setData(${candles});
    chart.timeScale().fitContent();
    </script></body></html>`
}

export default function StockDetailScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const route = useRoute<StockDetailRoute>()
  const { ticker } = route.params
  const { isFavorite, toggle } = useFavorites()
  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'financials' | 'balance'>('overview')
  const { width } = useWindowDimensions()

  const { data: info } = useQuery({
    queryKey: ['company-info', ticker],
    queryFn: async () => {
      const res = await api.get<CompanyInfo>(`/api/v1/companies/info/${ticker}`)
      return res.data
    },
  })

  const { data: priceData } = useQuery({
    queryKey: ['price-history', ticker],
    queryFn: async () => {
      const res = await api.get<PriceHistory[]>(`/api/v1/price/history/${ticker}?period=1y&interval=1d`)
      return res.data
    },
  })

  const { data: news } = useQuery({
    queryKey: ['news-detail', ticker],
    queryFn: async () => {
      const res = await api.get<NewsItem[]>(`/api/v1/news/${ticker}`)
      return res.data
    },
  })

  const m = info?.market
  const v = info?.valuation
  const tr = info?.trading
  const f = info?.financials
  const b = info?.balanceSheet
  const price = m?.currentPrice
  const change = price && m ? ((price - (priceData?.[priceData.length - 2]?.close || price)) / (priceData?.[priceData.length - 2]?.close || price) * 100) : null

  const tabs = [
    { key: 'overview', label: t('stockDetail.overview') },
    { key: 'news', label: t('stockDetail.news') },
    { key: 'financials', label: 'Finansallar' },
    { key: 'balance', label: 'Bilanço' },
  ] as const

  return (
    <View className="flex-1 bg-[#0a0a0f]">
      <View className="pt-12 px-4 pb-2 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <ThemedText className="text-blue-400 text-lg">← {t('common.back')}</ThemedText>
        </TouchableOpacity>
        <View className="flex-1">
          <ThemedText variant="h2">{ticker}</ThemedText>
          <ThemedText variant="caption" color="muted" numberOfLines={1}>{info?.name}</ThemedText>
        </View>
        <TouchableOpacity onPress={() => toggle(ticker)} className="p-2">
          <ThemedText className="text-xl">{isFavorite(ticker) ? '⭐' : '☆'}</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        <Card className="mb-4">
          <View className="flex-row items-center gap-3">
            <ThemedText variant="h1">₺{price?.toFixed(2) ?? '-'}</ThemedText>
            {change != null && (
              <Badge variant={change >= 0 ? 'success' : 'destructive'}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
              </Badge>
            )}
          </View>
        </Card>

        <View className="flex-row flex-wrap gap-2 mb-4">
          <Card className="w-[48%]"><ThemedText variant="caption" color="muted">{t('stocks.price')}</ThemedText><ThemedText>₺{price?.toFixed(2) ?? '-'}</ThemedText></Card>
          <Card className="w-[48%]"><ThemedText variant="caption" color="muted">Market Cap</ThemedText><ThemedText>${formatNum(m?.marketCap)}</ThemedText></Card>
          <Card className="w-[48%]"><ThemedText variant="caption" color="muted">Gün Aralığı</ThemedText><ThemedText>{m?.dayLow?.toFixed(2)} - {m?.dayHigh?.toFixed(2)}</ThemedText></Card>
          <Card className="w-[48%]"><ThemedText variant="caption" color="muted">Hacim</ThemedText><ThemedText>{formatNum(m?.regularMarketVolume, 0)}</ThemedText></Card>
          <Card className="w-[48%]"><ThemedText variant="caption" color="muted">52H Yüksek</ThemedText><ThemedText>₺{m?.fiftyTwoWeekHigh?.toFixed(2) ?? '-'}</ThemedText></Card>
          <Card className="w-[48%]"><ThemedText variant="caption" color="muted">52H Düşük</ThemedText><ThemedText>₺{m?.fiftyTwoWeekLow?.toFixed(2) ?? '-'}</ThemedText></Card>
        </View>

        <View className="flex-row mb-4 bg-[#1a1a2e] rounded-xl p-1">
          {tabs.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              className={`flex-1 py-2 rounded-lg items-center ${activeTab === key ? 'bg-blue-600' : ''}`}
              onPress={() => setActiveTab(key)}
            >
              <ThemedText variant="caption" color={activeTab === key ? 'default' : 'muted'}>{label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'overview' && (
          <>
            {priceData?.length ? (
              <Card className="mb-4">
                <ThemedText variant="h3" className="mb-2">{t('stockDetail.chart')}</ThemedText>
                <View className="h-56 rounded-lg overflow-hidden">
                  <WebView source={{ html: generateChartHTML(priceData) }} style={{ backgroundColor: '#1a1a2e' }} scrollEnabled={false} />
                </View>
              </Card>
            ) : null}

            {v && (
              <Card className="mb-4">
                <ThemedText variant="h3" className="mb-3">Değerleme</ThemedText>
                <View className="flex-row flex-wrap">
                  <View className="w-1/3 p-1"><ThemedText variant="caption" color="muted">F/K</ThemedText><ThemedText>{v.trailingPE?.toFixed(2) ?? '-'}</ThemedText></View>
                  <View className="w-1/3 p-1"><ThemedText variant="caption" color="muted">İleri F/K</ThemedText><ThemedText>{v.forwardPE?.toFixed(2) ?? '-'}</ThemedText></View>
                  <View className="w-1/3 p-1"><ThemedText variant="caption" color="muted">PD/DD</ThemedText><ThemedText>{v.priceToBook?.toFixed(2) ?? '-'}</ThemedText></View>
                  <View className="w-1/3 p-1"><ThemedText variant="caption" color="muted">PEG</ThemedText><ThemedText>{v.pegRatio?.toFixed(2) ?? '-'}</ThemedText></View>
                  <View className="w-1/3 p-1"><ThemedText variant="caption" color="muted">F/S</ThemedText><ThemedText>{v.priceToSalesTrailing12Months?.toFixed(2) ?? '-'}</ThemedText></View>
                  <View className="w-1/3 p-1"><ThemedText variant="caption" color="muted">Hedef Fiyat</ThemedText><ThemedText>₺{v.targetMeanPrice?.toFixed(2) ?? '-'}</ThemedText></View>
                </View>
              </Card>
            )}

            {tr && (
              <Card className="mb-4">
                <ThemedText variant="h3" className="mb-3">İşlem Görme</ThemedText>
                <View className="flex-row flex-wrap">
                  <View className="w-1/3 p-1"><ThemedText variant="caption" color="muted">Beta</ThemedText><ThemedText>{tr.beta?.toFixed(2) ?? '-'}</ThemedText></View>
                  <View className="w-1/3 p-1"><ThemedText variant="caption" color="muted">Ort. Hacim</ThemedText><ThemedText>{formatNum(tr.averageVolume, 0)}</ThemedText></View>
                  <View className="w-1/3 p-1"><ThemedText variant="caption" color="muted">50 Gün</ThemedText><ThemedText>₺{tr.fiftyDayAverage?.toFixed(2) ?? '-'}</ThemedText></View>
                  <View className="w-1/3 p-1"><ThemedText variant="caption" color="muted">200 Gün</ThemedText><ThemedText>₺{tr.twoHundredDayAverage?.toFixed(2) ?? '-'}</ThemedText></View>
                  <View className="w-1/3 p-1"><ThemedText variant="caption" color="muted">İçeriden %</ThemedText><ThemedText>{(tr.heldPercentInsiders * 100)?.toFixed(1) ?? '-'}%</ThemedText></View>
                  <View className="w-1/3 p-1"><ThemedText variant="caption" color="muted">Kurumsal %</ThemedText><ThemedText>{(tr.heldPercentInstitutions * 100)?.toFixed(1) ?? '-'}%</ThemedText></View>
                </View>
              </Card>
            )}
          </>
        )}

        {activeTab === 'news' && (
          <Card className="mb-4">
            <ThemedText variant="h3" className="mb-3">{t('stockDetail.news')}</ThemedText>
            {news?.length ? news.map((item, i) => (
              <TouchableOpacity key={i} className="py-3 border-b border-[#2d2d4a] last:border-b-0" onPress={() => item.url && Linking.openURL(item.url)}>
                <ThemedText>{item.title}</ThemedText>
                <ThemedText variant="caption" color="muted" className="mt-1">{new Date(item.date).toLocaleDateString('tr-TR')}</ThemedText>
              </TouchableOpacity>
            )) : <ThemedText color="muted">{t('common.loading')}</ThemedText>}
          </Card>
        )}

        {activeTab === 'financials' && f && (
          <Card className="mb-4">
            <ThemedText variant="h3" className="mb-3">Finansallar</ThemedText>
            <View className="flex-row flex-wrap">
              <View className="w-1/2 p-1"><ThemedText variant="caption" color="muted">Gelir</ThemedText><ThemedText>${formatNum(f.totalRevenue)}</ThemedText></View>
              <View className="w-1/2 p-1"><ThemedText variant="caption" color="muted">Gelir Büyüme</ThemedText><ThemedText>{formatPct(f.revenueGrowth)}</ThemedText></View>
              <View className="w-1/2 p-1"><ThemedText variant="caption" color="muted">Net Kar</ThemedText><ThemedText>${formatNum(f.netIncomeToCommon)}</ThemedText></View>
              <View className="w-1/2 p-1"><ThemedText variant="caption" color="muted">Kar Marjı</ThemedText><ThemedText>{formatPct(f.profitMargins)}</ThemedText></View>
              <View className="w-1/2 p-1"><ThemedText variant="caption" color="muted">FAVÖK</ThemedText><ThemedText>${formatNum(f.ebitda)}</ThemedText></View>
              <View className="w-1/2 p-1"><ThemedText variant="caption" color="muted">FAVÖK Marj</ThemedText><ThemedText>{formatPct(f.ebitdaMargins)}</ThemedText></View>
              <View className="w-1/2 p-1"><ThemedText variant="caption" color="muted">ÖZK</ThemedText><ThemedText>{formatPct(f.returnOnEquity)}</ThemedText></View>
              <View className="w-1/2 p-1"><ThemedText variant="caption" color="muted">AK</ThemedText><ThemedText>{formatPct(f.returnOnAssets)}</ThemedText></View>
              <View className="w-1/2 p-1"><ThemedText variant="caption" color="muted">Serbest Nakit</ThemedText><ThemedText>${formatNum(f.freeCashflow)}</ThemedText></View>
              <View className="w-1/2 p-1"><ThemedText variant="caption" color="muted">Brüt Marj</ThemedText><ThemedText>{formatPct(f.grossMargins)}</ThemedText></View>
            </View>
          </Card>
        )}

        {activeTab === 'balance' && b && (
          <Card className="mb-4">
            <ThemedText variant="h3" className="mb-3">Bilanço</ThemedText>
            <View className="flex-row flex-wrap">
              <View className="w-1/2 p-1"><ThemedText variant="caption" color="muted">Nakit</ThemedText><ThemedText>${formatNum(b.totalCash)}</ThemedText></View>
              <View className="w-1/2 p-1"><ThemedText variant="caption" color="muted">Nakit/Hisse</ThemedText><ThemedText>${b.totalCashPerShare?.toFixed(2) ?? '-'}</ThemedText></View>
              <View className="w-1/2 p-1"><ThemedText variant="caption" color="muted">Toplam Borç</ThemedText><ThemedText>${formatNum(b.totalDebt)}</ThemedText></View>
              <View className="w-1/2 p-1"><ThemedText variant="caption" color="muted">Borç/Özkaynak</ThemedText><ThemedText>{b.debtToEquity?.toFixed(2) ?? '-'}</ThemedText></View>
              <View className="w-1/2 p-1"><ThemedText variant="caption" color="muted">Cari Oran</ThemedText><ThemedText>{b.currentRatio?.toFixed(2) ?? '-'}</ThemedText></View>
              <View className="w-1/2 p-1"><ThemedText variant="caption" color="muted">Likidite</ThemedText><ThemedText>{b.quickRatio?.toFixed(2) ?? '-'}</ThemedText></View>
            </View>
          </Card>
        )}

        {info?.description && (
          <Card className="mb-4">
            <ThemedText variant="h3" className="mb-2">Şirket Hakkında</ThemedText>
            <ThemedText variant="body" color="muted">{info.description}</ThemedText>
          </Card>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  )
}
