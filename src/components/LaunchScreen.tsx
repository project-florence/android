import { View } from 'react-native'
import { ThemedText } from './ThemedText'

export default function LaunchScreen() {
  return (
    <View className="flex-1 bg-[#0a0a0f] items-center justify-center">
      <View className="w-20 h-20 bg-blue-600 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-blue-600/50">
        <ThemedText className="text-white text-4xl font-bold">F</ThemedText>
      </View>
      <ThemedText variant="h1" className="text-white">FlorenceX</ThemedText>
      <ThemedText variant="body" color="muted" className="mt-2">Akıllı Yatırım Asistanı</ThemedText>
    </View>
  )
}
