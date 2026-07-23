import { View, TouchableOpacity } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ThemedText, Card } from '@/components'
import api from '@/lib/api'
import type { Profile } from '@/types/api'

const greetings = [
  { start: 5, end: 11, text: 'Günaydın', emoji: '🌅' },
  { start: 11, end: 13, text: 'İyi günler', emoji: '☀️' },
  { start: 13, end: 17, text: 'Tünaydın', emoji: '🌤️' },
  { start: 17, end: 20, text: 'İyi akşamlar', emoji: '🌆' },
  { start: 20, end: 22, text: 'İyi akşamlar', emoji: '🌃' },
  { start: 22, end: 24, text: 'İyi geceler', emoji: '🌙' },
  { start: 0, end: 5, text: 'İyi geceler', emoji: '🌙' },
]

function getGreeting() {
  const hour = new Date().getHours()
  return greetings.find((g) => hour >= g.start && hour < g.end) || greetings[0]
}

const quickActions = [
  { label: 'Simülasyon', icon: '🔮', route: 'simulation' },
  { label: 'Danışman', icon: '📋', route: 'scout' },
  { label: 'Hisseler', icon: '📈', route: 'stocks' },
  { label: 'Raporlar', icon: '📄', route: 'reports' },
]

export default function WelcomeHero() {
  const { t } = useTranslation()
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get<Profile>('/api/v1/profile')
      return res.data
    },
    staleTime: 300_000,
  })

  const greeting = getGreeting()
  const today = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Card className="mb-4">
      <ThemedText variant="h1" className="mb-1">
        {greeting.emoji} {greeting.text}, {profile?.username || 'Yatırımcı'}
      </ThemedText>
      <ThemedText variant="caption" color="muted" className="mb-4">{today}</ThemedText>

      <View className="flex-row gap-2">
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.route}
            className="flex-1 bg-blue-600/20 rounded-xl py-3 items-center"
          >
            <ThemedText className="text-xl mb-1">{action.icon}</ThemedText>
            <ThemedText variant="caption" color="primary">{action.label}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  )
}
