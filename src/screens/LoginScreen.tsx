import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components'
import api from '@/lib/api'
import Toast from 'react-native-toast-message'

export default function LoginScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const setToken = useAuthStore((s) => s.setToken)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!username || !password) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('grant_type', 'password')
      params.append('username', username)
      params.append('password', password)

      const res = await api.post('/api/v1/auth/login', params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      setToken(res.data.access_token)
      Toast.show({ type: 'success', text1: t('auth.loginSuccess') })
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || t('auth.loginError')
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#0a0a0f]" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerClassName="flex-1 justify-center px-6">
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">F</Text>
          </View>
          <Text className="text-white text-3xl font-bold">Florence</Text>
          <Text className="text-slate-400 text-sm mt-1">{t('app.tagline')}</Text>
        </View>

        <View className="bg-[#1a1a2e] rounded-xl p-5 mb-4">
          <Text className="text-slate-300 text-sm mb-2">{t('auth.username')}</Text>
          <TextInput
            className="bg-[#0a0a0f] text-white border border-[#2d2d4a] rounded-lg px-4 py-3 mb-4"
            placeholder={t('auth.username')}
            placeholderTextColor="#64748b"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Text className="text-slate-300 text-sm mb-2">{t('auth.password')}</Text>
          <TextInput
            className="bg-[#0a0a0f] text-white border border-[#2d2d4a] rounded-lg px-4 py-3 mb-6"
            placeholder={t('auth.password')}
            placeholderTextColor="#64748b"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button loading={loading} onPress={handleLogin} className="w-full">
            {t('auth.login')}
          </Button>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register' as never)} className="items-center">
          <Text className="text-slate-400">
            {t('auth.noAccount')} <Text className="text-blue-400">{t('auth.register')}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
