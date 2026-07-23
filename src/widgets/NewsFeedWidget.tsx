import { View, TouchableOpacity, Linking } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ThemedText, Card } from '@/components'
import api from '@/lib/api'
import type { NewsItem } from '@/types/api'

interface NewsFeedWidgetProps {
  config?: { ticker?: string }
}

export default function NewsFeedWidget({ config }: NewsFeedWidgetProps) {
  const { t } = useTranslation()
  const ticker = config?.ticker || 'THYAO'

  const { data } = useQuery({
    queryKey: ['news', ticker],
    queryFn: async () => {
      const res = await api.get<NewsItem[]>(`/api/v1/news/${ticker}`)
      return res.data
    },
    staleTime: 60_000,
  })

  const news = data?.slice(0, 5)

  return (
    <Card className="mb-4">
      <ThemedText variant="h3" className="mb-3">
        {t('stockDetail.news')} - {ticker}
      </ThemedText>
      {news?.length ? (
        news.map((item, i) => (
          <TouchableOpacity
            key={i}
            className="py-2 border-b border-[#2d2d4a] last:border-b-0"
            onPress={() => item.url && Linking.openURL(item.url)}
          >
            <ThemedText variant="body" numberOfLines={2}>{item.title}</ThemedText>
            <ThemedText variant="caption" color="muted" className="mt-1">
              {new Date(item.date).toLocaleDateString('tr-TR')}
            </ThemedText>
          </TouchableOpacity>
        ))
      ) : (
        <ThemedText variant="caption" color="muted">{t('common.loading')}</ThemedText>
      )}
    </Card>
  )
}
