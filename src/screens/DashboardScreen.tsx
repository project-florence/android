import { ScrollView, RefreshControl, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ThemedText } from '@/components'
import {
  WelcomeHero,
  FavoritesBar,
  StatCardWidget,
  MacroeconomyWidget,
  StockChartWidget,
  SimulationWidget,
  NewsFeedWidget,
} from '@/widgets'

export default function DashboardScreen() {
  const { t } = useTranslation()

  return (
    <ScrollView className="flex-1 bg-[#0a0a0f] pt-12 px-4">
      <ThemedText variant="h1" className="mb-6">{t('dashboard.title')}</ThemedText>

      <WelcomeHero />

      <FavoritesBar />

      <View className="flex-row gap-3 mb-4">
        <StatCardWidget config={{ titleKey: 'dashboard.gold', dataSource: 'gold' }} />
        <StatCardWidget config={{ titleKey: 'dashboard.usd', dataSource: 'currency', pair: 'USD' }} />
        <StatCardWidget config={{ titleKey: 'dashboard.eur', dataSource: 'currency', pair: 'EUR' }} />
      </View>

      <MacroeconomyWidget />

      <View className="flex-row gap-3 mb-4">
        <SimulationWidget config={{ ticker: 'THYAO' }} />
        <SimulationWidget config={{ ticker: 'GARAN' }} />
      </View>

      <StockChartWidget config={{ ticker: 'THYAO' }} />

      <NewsFeedWidget config={{ ticker: 'THYAO' }} />

      <View className="h-8" />
    </ScrollView>
  )
}
