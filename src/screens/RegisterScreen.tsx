import { useState } from 'react'
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { Button, ThemedText } from '@/components'
import api from '@/lib/api'
import Toast from 'react-native-toast-message'

export default function RegisterScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [acceptedPolicies, setAcceptedPolicies] = useState({
    terms: false,
    privacy_policy: false,
    cookie_policy: false,
    disclaimer: false,
  })

  const allAccepted = Object.values(acceptedPolicies).every(Boolean)

  const handleRegister = async () => {
    if (!allAccepted) {
      Toast.show({ type: 'error', text1: t('auth.acceptPolicies') })
      return
    }
    setLoading(true)
    try {
      await api.post('/api/v1/auth/register', { username, email, password })
      Toast.show({ type: 'success', text1: t('auth.registerSuccess') })
      navigation.goBack()
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || t('auth.registerError')
      Toast.show({ type: 'error', text1: msg })
    } finally {
      setLoading(false)
    }
  }

  const policies = [
    { key: 'terms', label: t('legal.terms') },
    { key: 'privacy_policy', label: t('legal.privacyPolicy') },
    { key: 'cookie_policy', label: t('legal.cookiePolicy') },
    { key: 'disclaimer', label: t('legal.disclaimer') },
  ] as const

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#0a0a0f]" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerClassName="flex-1 justify-center px-6">
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center mb-3">
            <ThemedText className="text-3xl font-bold text-white">F</ThemedText>
          </View>
          <ThemedText variant="h1">{t('auth.register')}</ThemedText>
        </View>

        <View className="bg-[#1a1a2e] rounded-xl p-5 mb-4">
          <ThemedText variant="caption" color="muted" className="mb-2">{t('auth.username')}</ThemedText>
          <TextInput
            className="bg-[#0a0a0f] text-white border border-[#2d2d4a] rounded-lg px-4 py-3 mb-3"
            placeholder={t('auth.username')}
            placeholderTextColor="#64748b"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <ThemedText variant="caption" color="muted" className="mb-2">{t('auth.email')}</ThemedText>
          <TextInput
            className="bg-[#0a0a0f] text-white border border-[#2d2d4a] rounded-lg px-4 py-3 mb-3"
            placeholder={t('auth.email')}
            placeholderTextColor="#64748b"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <ThemedText variant="caption" color="muted" className="mb-2">{t('auth.password')}</ThemedText>
          <TextInput
            className="bg-[#0a0a0f] text-white border border-[#2d2d4a] rounded-lg px-4 py-3 mb-4"
            placeholder={t('auth.password')}
            placeholderTextColor="#64748b"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View className="mb-4">
            {policies.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                className="flex-row items-center py-2"
                onPress={() => setAcceptedPolicies((p) => ({ ...p, [key]: !p[key] }))}
              >
                <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${acceptedPolicies[key] ? 'bg-blue-600 border-blue-600' : 'border-slate-600'}`}>
                  {acceptedPolicies[key] && <ThemedText className="text-white text-xs">✓</ThemedText>}
                </View>
                <ThemedText variant="caption" color="muted">{t('legal.accept')} {label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <Button loading={loading} onPress={handleRegister} className="w-full">
            {t('auth.register')}
          </Button>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} className="items-center">
          <ThemedText color="muted">
            {t('auth.hasAccount')} <ThemedText color="primary">{t('auth.login')}</ThemedText>
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
