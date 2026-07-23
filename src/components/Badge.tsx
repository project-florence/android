import { type ViewProps, View, Text } from 'react-native'
import { cn } from '@/lib/utils'

interface BadgeProps extends ViewProps {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline'
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  const variantClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-amber-600',
    destructive: 'bg-red-600',
    outline: 'border border-slate-600',
  }

  const textClasses = {
    default: 'text-white',
    success: 'text-white',
    warning: 'text-white',
    destructive: 'text-white',
    outline: 'text-slate-300',
  }

  return (
    <View className={cn('px-2 py-0.5 rounded-full', variantClasses[variant], className)} {...props}>
      <Text className={cn('text-xs font-medium', textClasses[variant])}>{children}</Text>
    </View>
  )
}
