import { View, ScrollView, TouchableOpacity, Share } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import { ThemedText, Card, Button } from '@/components'
import api from '@/lib/api'
import type { ReportDetail } from '@/types/api'
import type { ProfileStackParamList } from '@/navigation/types'

type ReportDetailRoute = RouteProp<ProfileStackParamList, 'ReportDetail'>

export default function ReportDetailScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const route = useRoute<ReportDetailRoute>()
  const { reportId } = route.params

  const { data: report } = useQuery({
    queryKey: ['report', reportId],
    queryFn: async () => {
      const res = await api.get<ReportDetail>(`/api/v1/reports/${reportId}`)
      return res.data
    },
  })

  if (!report) {
    return (
      <View className="flex-1 bg-[#0a0a0f] pt-12 px-4">
        <ThemedText color="muted" className="text-center">{t('common.loading')}</ThemedText>
      </View>
    )
  }

  const downloadReport = async (ftype: string) => {
    try {
      const res = await api.post(`/api/v1/reports/download?report_id=${reportId}&ftype=${ftype}`, {}, { responseType: 'blob' })
      Share.share({ message: `Rapor indiriliyor (${ftype})` })
    } catch {
      Share.share({ message: `Rapor: ${report.title}` })
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#22c55e'
      case 'negative': return '#ef4444'
      default: return '#94a3b8'
    }
  }

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '👍'
      case 'negative': return '👎'
      default: return '➖'
    }
  }

  return (
    <View className="flex-1 bg-[#0a0a0f]">
      <View className="pt-12 px-4 pb-2 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <ThemedText className="text-blue-400 text-lg">← {t('reports.backToReports')}</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        <Card className="mb-4">
          <ThemedText variant="h2" className="mb-2">{report.title}</ThemedText>
          <View className="flex-row gap-2 mb-3">
            <View className="bg-blue-600/20 rounded-full px-3 py-1">
              <ThemedText variant="caption" color="primary">{report.about}</ThemedText>
            </View>
            <View className="bg-slate-700/40 rounded-full px-3 py-1">
              <ThemedText variant="caption" color="muted">{report.type}</ThemedText>
            </View>
          </View>
        </Card>

        <View className="flex-row gap-2 mb-4">
          {['md', 'pdf', 'docx'].map((ftype) => (
            <Button key={ftype} variant="outline" size="sm" className="flex-1" onPress={() => downloadReport(ftype)}>
              {ftype === 'md' ? t('reports.downloadMd') : ftype === 'pdf' ? t('reports.downloadPdf') : t('reports.downloadDocx')}
            </Button>
          ))}
        </View>

        <Card className="mb-4">
          <ThemedText variant="h3" className="mb-3">{t('reports.sentiments')}</ThemedText>
          {report.sentiments?.length ? (
            report.sentiments.map((s, i) => (
              <View key={i} className="flex-row items-start py-2 border-b border-[#2d2d4a] last:border-b-0">
                <ThemedText className="mr-2">{getSentimentEmoji(s.sentiment)}</ThemedText>
                <View className="flex-1">
                  <ThemedText variant="caption" style={{ color: getSentimentColor(s.sentiment) }} className="capitalize">
                    {s.sentiment}
                  </ThemedText>
                  <ThemedText variant="caption" color="muted" className="mt-0.5">{s.reasoning}</ThemedText>
                </View>
              </View>
            ))
          ) : (
            <ThemedText variant="caption" color="muted">{t('common.noData')}</ThemedText>
          )}
        </Card>

        <Card className="mb-4">
          <ThemedText variant="h3" className="mb-3">Rapor İçeriği</ThemedText>
          <ThemedText variant="body" color="muted" className="leading-6">
            {report.report}
          </ThemedText>
        </Card>

        <Card className="mb-4">
          <View className="flex-row justify-between">
            <View>
              <ThemedText variant="caption" color="muted">{t('reports.cost')}</ThemedText>
              <ThemedText>{report.credits_spend} 🪙</ThemedText>
            </View>
            <View>
              <ThemedText variant="caption" color="muted">{t('reports.tokens')}</ThemedText>
              <ThemedText>{report.token_usage?.total ?? '-'}</ThemedText>
            </View>
            <View>
              <ThemedText variant="caption" color="muted">Kalan</ThemedText>
              <ThemedText>{report.remaining_credits} 🪙</ThemedText>
            </View>
          </View>
        </Card>

        <View className="h-8" />
      </ScrollView>
    </View>
  )
}
