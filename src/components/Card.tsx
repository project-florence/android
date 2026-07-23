import { type ViewProps, View } from 'react-native'
import { cn } from '@/lib/utils'

interface CardProps extends ViewProps {
  variant?: 'default' | 'outline'
}

export function Card({ variant = 'default', className, children, ...props }: CardProps) {
  return (
    <View
      className={cn(
        'rounded-xl p-4',
        variant === 'default' ? 'bg-[#1a1a2e]' : 'border border-[#2d2d4a]',
        className,
      )}
      {...props}
    >
      {children}
    </View>
  )
}

export function CardHeader({ className, children, ...props }: ViewProps) {
  return (
    <View className={cn('mb-3', className)} {...props}>
      {children}
    </View>
  )
}

export function CardContent({ className, children, ...props }: ViewProps) {
  return (
    <View className={cn('', className)} {...props}>
      {children}
    </View>
  )
}
