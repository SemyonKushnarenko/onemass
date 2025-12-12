import React, { forwardRef } from 'react'
import { cn } from '../../lib/utils'
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'mood-1'
    | 'mood-2'
    | 'mood-3'
    | 'mood-4'
    | 'mood-5'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      outline:
        'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700',
      ghost: 'hover:bg-gray-100 text-gray-700',
      'mood-1': 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
      'mood-2': 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm',
      'mood-3': 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm',
      'mood-4': 'bg-lime-500 text-white hover:bg-lime-600 shadow-sm',
      'mood-5': 'bg-green-500 text-white hover:bg-green-600 shadow-sm',
    }
    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 text-lg',
      icon: 'h-10 w-10 p-0 flex items-center justify-center',
    }
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
export { Button }
