export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type MainTabParamList = {
  DashboardTab: undefined
  StocksTab: undefined
  WatchlistTab: undefined
  SimulationTab: undefined
  ProfileTab: undefined
}

export type DashboardStackParamList = {
  Dashboard: undefined
}

export type StocksStackParamList = {
  Stocks: undefined
  StockDetail: { ticker: string }
}

export type WatchlistStackParamList = {
  Watchlist: undefined
  StockDetail: { ticker: string }
}

export type SimulationStackParamList = {
  Simulation: undefined
}

export type ProfileStackParamList = {
  Profile: undefined
  Advisor: undefined
  Reports: undefined
  ReportDetail: { reportId: number }
  IPOs: undefined
  Currency: undefined
  Metals: undefined
  About: undefined
  Contact: undefined
  Legal: { policy: string }
}
