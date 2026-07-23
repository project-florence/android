import { useState } from 'react'
import { View, ScrollView, TouchableOpacity, Linking } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ThemedText, Card } from '@/components'
import api from '@/lib/api'
import type { IpoListItem, IpoDetail } from '@/types/api'

export default function IPOsScreen() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'active' | 'draft'>('active')
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)

  const { data: activeList } = useQuery({
    queryKey: ['ipos-active'],
    queryFn: async () => {
      const res = await api.get<IpoListItem[]>('/api/v1/ipos/active')
      return res.data
    },
  })

  const { data: draftList } = useQuery({
    queryKey: ['ipos-draft'],
    queryFn: async () => {
      const res = await api.get<IpoListItem[]>('/api/v1/ipos/draft')
      return res.data
    },
  })

  const list = activeTab === 'active' ? activeList : draftList

  const IpoDetailCard = ({ slug }: { slug: string }) => {
    const { data: detail } = useQuery({
      queryKey: ['ipo-detail', slug],
      queryFn: async () => {
        const res = await api.get<IpoDetail>(`/api/v1/ipos/${slug}`)
        return res.data
      },
      enabled: !!slug,
    })

    if (!detail) return null

    const infoFields = [
      { label: 'Fiyat', value: detail.info?.price },
      { label: 'Miktar', value: detail.info?.quantity },
      { label: 'Pazar', value: detail.info?.market },
      { label: 'Tarih', value: detail.info?.date },
      { label: 'Büyüklük', value: detail.info?.size },
      { label: 'İndirim', value: detail.info?.discount },
      { label: 'Dağıtım', value: detail.info?.distribution },
    ].filter((f) => f.value)

    return (
      <Card className="mt-2">
        {detail.ticker && (
          <ThemedText variant="h3" className="mb-2">{detail.ticker} - {detail.company_name}</ThemedText>
        )}
        <View className="flex-row flex-wrap">
          {infoFields.map((f) => (
            <View key={f.label} className="w-1/2 p-1">
              <ThemedText variant="caption" color="muted">{f.label}</ThemedText>
              <ThemedText variant="body">{f.value}</ThemedText>
            </View>
          ))}
        </View>
        {detail.company && (
          <View className="flex-row gap-4 mt-2 pt-2 border-t border-[#2d2d4a]">
            <ThemedText variant="caption" color="muted">📍 {detail.company.city}</ThemedText>
            <ThemedText variant="caption" color="muted">📅 {detail.company.founded}</ThemedText>
          </View>
        )}
        {Object.entries(detail.sections || {}).map(([key, val]) => (
          val ? (
            <View key={key} className="mt-2 pt-2 border-t border-[#2d2d4a]">
              <ThemedText variant="label" className="capitalize mb-1">{key}</ThemedText>
              <ThemedText variant="body" color="muted">{val}</ThemedText>
            </View>
          ) : null
        ))}
      </Card>
    )
  }

  return (
    <View className="flex-1 bg-[#0a0a0f] pt-12 px-4">
      <ThemedText variant="h1" className="mb-6">{t('ipos.title')}</ThemedText>

      <View className="flex-row mb-4 bg-[#1a1a2e] rounded-xl p-1">
        {(['active', 'draft'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-2 rounded-lg items-center ${activeTab === tab ? 'bg-blue-600' : ''}`}
            onPress={() => setActiveTab(tab)}
          >
            <ThemedText variant="label" color={activeTab === tab ? 'default' : 'muted'}>
              {tab === 'active' ? 'Güncel' : 'Taslak'}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView>
        {list?.length ? list.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => setExpandedSlug(expandedSlug === item.slug ? null : item.slug)}>
            <Card className="mb-2">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <ThemedText variant="h3">{item.title}</ThemedText>
                  <ThemedText variant="caption" color="muted">{new Date(item.date).toLocaleDateString('tr-TR')}</ThemedText>
                </View>
                {item.link && (
                  <TouchableOpacity onPress={() => Linking.openURL(item.link)} className="ml-2">
                    <ThemedText className="text-blue-400 text-xl">🔗</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
              {expandedSlug === item.slug && <IpoDetailCard slug={item.slug} />}
            </Card>
          </TouchableOpacity>
        )) : (
          <ThemedText color="muted" className="text-center py-8">{t('common.loading')}</ThemedText>
        )}
        <View className="h-8" />
      </ScrollView>
    </View>
  )
}
