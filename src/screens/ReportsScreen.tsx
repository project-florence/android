import { useState } from 'react'
import { View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { ThemedText, Card, Button } from '@/components'
import api from '@/lib/api'
import type { ReportInfo, ReportHistoryItem, ReportDetail } from '@/types/api'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { ProfileStackParamList } from '@/navigation/types'

const statusMessages = [
  'Piyasalar taranıyor...',
  'Veriler analiz ediliyor...',
  'Haberler inceleniyor...',
  'Rapor oluşturuluyor...',
  'Son rötuşlar yapılıyor...',
]

export default function ReportsScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>()
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new')
  const [ticker, setTicker] = useState('THYAO')
  const [reportType, setReportType] = useState('quick_report')
  const [searchQuery, setSearchQuery] = useState('')
  const [generating, setGenerating] = useState(false)
  const [statusIndex, setStatusIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [reportResult, setReportResult] = useState<ReportDetail | null>(null)

  const { data: reportInfo } = useQuery({
    queryKey: ['report-info'],
    queryFn: async () => {
      const res = await api.get<ReportInfo>('/api/v1/reports/info')
      return res.data
    },
  })

  const { data: history } = useQuery({
    queryKey: ['report-history', searchQuery],
    queryFn: async () => {
      const url = searchQuery ? `/api/v1/reports/search?q=${searchQuery}` : '/api/v1/reports/history'
      const res = await api.get<ReportHistoryItem[]>(url)
      return res.data
    },
    enabled: activeTab === 'history',
  })

  const generateReport = async () => {
    setGenerating(true)
    setReportResult(null)
    setProgress(0)
    setStatusIndex(0)

    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % statusMessages.length)
      setProgress((p) => Math.min(p + 0.15, 0.9))
    }, 2000)

    try {
      const res = await api.post<ReportDetail>(`/api/v1/reports/generate?ticker=${ticker}&type=${reportType}`, {}, { timeout: 600000 })
      setReportResult(res.data)
      setProgress(1)
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || t('reports.error')
      Alert.alert('Hata', msg)
    } finally {
      clearInterval(interval)
      setGenerating(false)
    }
  }

  const reportTypeInfo = reportType === 'quick_report' ? reportInfo?.quick_report : reportInfo?.deep_report
  const cost = reportTypeInfo?.est_cost

  return (
    <View className="flex-1 bg-[#0a0a0f] pt-12 px-4">
      <ThemedText variant="h1" className="mb-6">{t('reports.title')}</ThemedText>

      <View className="flex-row mb-4 bg-[#1a1a2e] rounded-xl p-1">
        {(['new', 'history'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-2 rounded-lg items-center ${activeTab === tab ? 'bg-blue-600' : ''}`}
            onPress={() => setActiveTab(tab)}
          >
            <ThemedText variant="label" color={activeTab === tab ? 'default' : 'muted'}>
              {tab === 'new' ? t('reports.newReport') : t('reports.history')}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'new' ? (
        <ScrollView>
          <Card className="mb-4">
            <ThemedText variant="label" color="muted" className="mb-2">{t('reports.selectStock')}</ThemedText>
            <TextInput
              className="bg-[#0a0a0f] text-white border border-[#2d2d4a] rounded-lg px-4 py-3 mb-4"
              value={ticker}
              onChangeText={setTicker}
              autoCapitalize="characters"
              placeholder="THYAO"
              placeholderTextColor="#64748b"
            />

            <ThemedText variant="label" color="muted" className="mb-2">{t('reports.reportType')}</ThemedText>
            <View className="flex-row gap-2 mb-4">
              {(['quick_report', 'deep_report'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  className={`flex-1 py-3 rounded-lg items-center ${reportType === type ? 'bg-blue-600' : 'bg-[#0a0a0f] border border-[#2d2d4a]'}`}
                  onPress={() => setReportType(type)}
                >
                  <ThemedText variant="caption">
                    {type === 'quick_report' ? t('reports.quickReport') : t('reports.deepReport')}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {cost != null && (
              <ThemedText variant="caption" color="muted" className="mb-4">
                {t('reports.estCost', { cost })}
              </ThemedText>
            )}

            <Button onPress={generateReport} loading={generating}>
              {t('reports.generate')}
            </Button>
          </Card>

          {generating && (
            <Card className="mb-4">
              <ThemedText variant="h3" className="mb-2">Rapor Oluşturuluyor...</ThemedText>
              <ThemedText variant="caption" color="muted" className="mb-3">{statusMessages[statusIndex]}</ThemedText>
              <View className="h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
                <View className="h-full bg-blue-600 rounded-full" style={{ width: `${progress * 100}%` }} />
              </View>
            </Card>
          )}

          {reportResult && (
            <Card className="mb-4">
              <ThemedText variant="h3" className="mb-2">{reportResult.title}</ThemedText>
              <ThemedText variant="caption" color="muted" className="mb-3">{reportResult.type} • {new Date(reportResult.created_at).toLocaleDateString('tr-TR')}</ThemedText>
              <View className="flex-row gap-2 mb-3">
                <Badge badge="primary">{reportResult.about}</Badge>
              </View>
              <ThemedText variant="body" color="muted" className="mb-3" numberOfLines={10}>{reportResult.report.slice(0, 500)}...</ThemedText>
              <Button variant="outline" onPress={() => navigation.navigate('ReportDetail', { reportId: reportResult.report_id })}>
                {t('common.details')}
              </Button>
            </Card>
          )}

          <View className="h-8" />
        </ScrollView>
      ) : (
        <View className="flex-1">
          <TextInput
            className="bg-[#1a1a2e] text-white border border-[#2d2d4a] rounded-lg px-4 py-3 mb-4"
            placeholder={t('reports.search')}
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <ScrollView>
            {history?.length ? history.map((item) => (
              <TouchableOpacity key={item.id} onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}>
                <Card className="mb-2">
                  <View className="flex-row justify-between">
                    <View className="flex-1">
                      <ThemedText>{item.title}</ThemedText>
                      <View className="flex-row gap-2 mt-1">
                        <Badge badge="outline">{item.ticker}</Badge>
                        <Badge badge="outline">{item.type}</Badge>
                      </View>
                    </View>
                    <ThemedText variant="caption" color="muted">
                      {new Date(item.created_at).toLocaleDateString('tr-TR')}
                    </ThemedText>
                  </View>
                </Card>
              </TouchableOpacity>
            )) : (
              <ThemedText color="muted" className="text-center py-8">{t('reports.noResults')}</ThemedText>
            )}
            <View className="h-8" />
          </ScrollView>
        </View>
      )}
    </View>
  )
}

function Badge({ badge, children }: { badge: string; children: React.ReactNode }) {
  return (
    <View className="bg-blue-600/20 rounded-full px-2 py-0.5">
      <ThemedText variant="caption" color="primary">{children}</ThemedText>
    </View>
  )
}
