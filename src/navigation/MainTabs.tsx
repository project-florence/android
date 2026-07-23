import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { View, Text } from 'react-native'
import {
  DashboardScreen,
  StocksScreen,
  StockDetailScreen,
  WatchlistScreen,
  SimulationScreen,
  ProfileScreen,
  AdvisorScreen,
  ReportsScreen,
  ReportDetailScreen,
  IPOsScreen,
  CurrencyScreen,
  MetalsScreen,
  AboutScreen,
  ContactScreen,
  LegalScreen,
} from '@/screens'
import type {
  MainTabParamList,
  DashboardStackParamList,
  StocksStackParamList,
  WatchlistStackParamList,
  SimulationStackParamList,
  ProfileStackParamList,
} from './types'

const Tab = createBottomTabNavigator<MainTabParamList>()

const DashboardStack = createNativeStackNavigator<DashboardStackParamList>()
const StocksStack = createNativeStackNavigator<StocksStackParamList>()
const WatchlistStack = createNativeStackNavigator<WatchlistStackParamList>()
const SimulationStack = createNativeStackNavigator<SimulationStackParamList>()
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>()

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '📊',
    Stocks: '📈',
    Watchlist: '⭐',
    Simulation: '🔮',
    Profile: '👤',
  }
  return (
    <View style={{ opacity: focused ? 1 : 0.5 }}>
      <Text style={{ fontSize: 22 }}>{icons[name] || '•'}</Text>
    </View>
  )
}

function DashboardStackScreen() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="Dashboard" component={DashboardScreen} />
    </DashboardStack.Navigator>
  )
}

function StocksStackScreen() {
  return (
    <StocksStack.Navigator screenOptions={{ headerShown: false }}>
      <StocksStack.Screen name="Stocks" component={StocksScreen} />
      <StocksStack.Screen name="StockDetail" component={StockDetailScreen} />
    </StocksStack.Navigator>
  )
}

function WatchlistStackScreen() {
  return (
    <WatchlistStack.Navigator screenOptions={{ headerShown: false }}>
      <WatchlistStack.Screen name="Watchlist" component={WatchlistScreen} />
      <WatchlistStack.Screen name="StockDetail" component={StockDetailScreen} />
    </WatchlistStack.Navigator>
  )
}

function SimulationStackScreen() {
  return (
    <SimulationStack.Navigator screenOptions={{ headerShown: false }}>
      <SimulationStack.Screen name="Simulation" component={SimulationScreen} />
    </SimulationStack.Navigator>
  )
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="Advisor" component={AdvisorScreen} />
      <ProfileStack.Screen name="Reports" component={ReportsScreen} />
      <ProfileStack.Screen name="ReportDetail" component={ReportDetailScreen} />
      <ProfileStack.Screen name="IPOs" component={IPOsScreen} />
      <ProfileStack.Screen name="Currency" component={CurrencyScreen} />
      <ProfileStack.Screen name="Metals" component={MetalsScreen} />
      <ProfileStack.Screen name="About" component={AboutScreen} />
      <ProfileStack.Screen name="Contact" component={ContactScreen} />
      <ProfileStack.Screen name="Legal" component={LegalScreen} />
    </ProfileStack.Navigator>
  )
}

export function MainTabs() {
  const { t } = useTranslation()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f0f1a',
          borderTopColor: '#2d2d4a',
          borderTopWidth: 1,
          paddingTop: 4,
          height: 60,
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: { fontSize: 11, marginBottom: 4 },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackScreen}
        options={{
          tabBarLabel: t('nav.dashboard'),
          tabBarIcon: ({ focused }) => <TabIcon name="Dashboard" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="StocksTab"
        component={StocksStackScreen}
        options={{
          tabBarLabel: t('nav.stocks'),
          tabBarIcon: ({ focused }) => <TabIcon name="Stocks" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="WatchlistTab"
        component={WatchlistStackScreen}
        options={{
          tabBarLabel: t('nav.watchlist'),
          tabBarIcon: ({ focused }) => <TabIcon name="Watchlist" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="SimulationTab"
        component={SimulationStackScreen}
        options={{
          tabBarLabel: t('nav.simulation'),
          tabBarIcon: ({ focused }) => <TabIcon name="Simulation" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        options={{
          tabBarLabel: t('nav.profile'),
          tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  )
}
