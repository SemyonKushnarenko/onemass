import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { MoodEntry } from '../lib/types'
import { formatShortDate, getMoodValue } from '../lib/utils'
interface MoodChartProps {
  data: MoodEntry[]
}
export function MoodChart({ data }: MoodChartProps) {
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      ...entry,
      formattedDate: formatShortDate(entry.date),
      mood: getMoodValue(entry),
    }))
  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        Нет данных для отображения
      </div>
    )
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 20,
            bottom: 5,
            left: 0,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E7EB"
          />
          <XAxis
            dataKey="formattedDate"
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            cursor={{
              stroke: '#4A90E2',
              strokeWidth: 2,
              strokeDasharray: '4 4',
            }}
          />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#4A90E2"
            strokeWidth={3}
            dot={{
              r: 4,
              fill: '#4A90E2',
              strokeWidth: 2,
              stroke: '#fff',
            }}
            activeDot={{
              r: 6,
              fill: '#4A90E2',
            }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
