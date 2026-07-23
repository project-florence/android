import { type TouchableOpacityProps, TouchableOpacity, Text, ActivityIndicator } from 'react-native'
import { cn } from '@/lib/utils'

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'flex-row items-center justify-center rounded-lg'

  const variantClasses = {
    primary: 'bg-blue-600 active:bg-blue-700',
    secondary: 'bg-slate-700 active:bg-slate-600',
    outline: 'border border-slate-600 active:bg-slate-800',
    ghost: 'active:bg-slate-800',
    destructive: 'bg-red-600 active:bg-red-700',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5',
    md: 'px-4 py-2.5',
    lg: 'px-6 py-3',
  }

  const textVariants = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-blue-400',
    ghost: 'text-slate-300',
    destructive: 'text-white',
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  return (
    <TouchableOpacity
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], disabled && 'opacity-50', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text className={cn('font-semibold', textVariants[variant], textSizes[size])}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  )
}
