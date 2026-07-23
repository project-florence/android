import { type TextProps, Text as RNText } from 'react-native'
import { cn } from '@/lib/utils'

interface ThemedTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label'
  color?: 'default' | 'muted' | 'primary' | 'success' | 'destructive'
}

export function ThemedText({ variant = 'body', color = 'default', className, style, ...props }: ThemedTextProps) {
  const variantClasses = {
    h1: 'text-2xl font-bold',
    h2: 'text-xl font-bold',
    h3: 'text-lg font-semibold',
    body: 'text-base',
    caption: 'text-sm',
    label: 'text-sm font-medium',
  }

  const colorClasses = {
    default: 'text-slate-100',
    muted: 'text-slate-400',
    primary: 'text-blue-400',
    success: 'text-green-400',
    destructive: 'text-red-400',
  }

  return (
    <RNText className={cn(variantClasses[variant], colorClasses[color], className)} style={style} {...props} />
  )
}
