import type { MoodEntry } from '../lib/types'
import { formatDate, getMoodValue, cn } from '../lib/utils'
interface StatsTableProps {
  entries: MoodEntry[]
}
export function StatsTable({ entries }: StatsTableProps) {
  const getMoodColor = (mood: number) => {
    switch (mood) {
      case 1:
        return 'bg-red-500'
      case 2:
        return 'bg-orange-500'
      case 3:
        return 'bg-yellow-500'
      case 4:
        return 'bg-lime-500'
      case 5:
        return 'bg-green-500'
      default:
        return 'bg-gray-300'
    }
  }
  const getMoodLabel = (mood: number) => {
    switch (mood) {
      case 1:
        return 'Очень плохо'
      case 2:
        return 'Плохо'
      case 3:
        return 'Нормально'
      case 4:
        return 'Хорошо'
      case 5:
        return 'Отлично'
      default:
        return '-'
    }
  }
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Дата</th>
              <th className="px-6 py-3 font-medium">Настроение</th>
              <th className="px-6 py-3 font-medium">Комментарий</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  Нет записей за этот период
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                    {formatDate(entry.date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'h-3 w-3 rounded-full',
                          getMoodColor(getMoodValue(entry)),
                        )}
                      />
                      <span className="font-medium text-gray-700">
                        {getMoodLabel(getMoodValue(entry))}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                    {entry.comment || (
                      <span className="text-gray-400 italic">
                        Нет комментария
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
