import React from 'react'
import { Frown, Meh, Smile, Angry, Heart } from 'lucide-react'
import { cn } from '../lib/utils'
import type { MoodValue } from '../lib/types'
interface MoodSelectorProps {
  value: MoodValue | null
  onChange: (value: MoodValue) => void
}
export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  const moods: {
    value: MoodValue
    label: string
    icon: React.ReactNode
    colorClass: string
    activeClass: string
  }[] = [
    {
      value: 1,
      label: 'Очень плохо',
      icon: <Angry className="w-8 h-8" />,
      colorClass: 'text-red-500 hover:bg-red-50',
      activeClass: 'bg-red-100 ring-2 ring-red-500',
    },
    {
      value: 2,
      label: 'Плохо',
      icon: <Frown className="w-8 h-8" />,
      colorClass: 'text-orange-500 hover:bg-orange-50',
      activeClass: 'bg-orange-100 ring-2 ring-orange-500',
    },
    {
      value: 3,
      label: 'Нормально',
      icon: <Meh className="w-8 h-8" />,
      colorClass: 'text-yellow-500 hover:bg-yellow-50',
      activeClass: 'bg-yellow-100 ring-2 ring-yellow-500',
    },
    {
      value: 4,
      label: 'Хорошо',
      icon: <Smile className="w-8 h-8" />,
      colorClass: 'text-lime-500 hover:bg-lime-50',
      activeClass: 'bg-lime-100 ring-2 ring-lime-500',
    },
    {
      value: 5,
      label: 'Отлично',
      icon: <Heart className="w-8 h-8" />,
      colorClass: 'text-green-500 hover:bg-green-50',
      activeClass: 'bg-green-100 ring-2 ring-green-500',
    },
  ]
  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-4 w-full">
      {moods.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onChange(mood.value)}
          className={cn(
            'flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 group',
            mood.colorClass,
            value === mood.value
              ? mood.activeClass + ' scale-110'
              : 'bg-white border border-gray-100 shadow-sm hover:scale-105',
          )}
        >
          <div
            className={cn(
              'mb-2 transition-transform duration-200',
              value === mood.value && 'scale-110',
            )}
          >
            {mood.icon}
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-gray-600 group-hover:text-gray-900 hidden sm:block">
            {mood.label}
          </span>
        </button>
      ))}
    </div>
  )
}
