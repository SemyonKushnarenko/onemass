import { Link } from 'react-router-dom'
import { ArrowLeft, Calendar } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { MoodChart } from '../components/MoodChart'
import { StatsTable } from '../components/StatsTable'
import useMoodList from '../hooks/api/query/useMoodList'
import useMoodStats from '../hooks/api/query/useMoodStats'
import { getMoodValue } from '../lib/utils'

export function PatientStats() {
  const { data: entries = [], isLoading } = useMoodList()
  const { data: stats, isLoading: loadingStats } = useMoodStats()

  const calculateAverage = (data: typeof entries) => {
    if (data.length === 0) return '0'
    const sum = data.reduce((acc, curr) => acc + getMoodValue(curr), 0)
    return (sum / data.length).toFixed(1)
  }
  const getAverageColor = (avg: number) => {
    if (avg >= 4.5) return 'text-green-600'
    if (avg >= 3.5) return 'text-lime-600'
    if (avg >= 2.5) return 'text-yellow-600'
    if (avg >= 1.5) return 'text-orange-600'
    return 'text-red-600'
  }
  const monthAvg = stats?.avgMonth?.toFixed(1) ?? calculateAverage(entries.slice(0, 30))
  const yearAvg = stats?.avgYear?.toFixed(1) ?? calculateAverage(entries)
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/patient">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Статистика</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              За месяц
            </span>
            <div
              className={`text-5xl font-bold mt-2 ${getAverageColor(Number(monthAvg))}`}
            >
              {loadingStats ? '...' : monthAvg}
            </div>
            <span className="text-sm text-gray-400 mt-1">из 5</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              За год
            </span>
            <div
              className={`text-5xl font-bold mt-2 ${getAverageColor(Number(yearAvg))}`}
            >
              {loadingStats ? '...' : yearAvg}
            </div>
            <span className="text-sm text-gray-400 mt-1">из 5</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>График настроения</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">Загрузка...</div>
          ) : (
            <MoodChart data={entries} />
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          Записи за месяц
        </h2>
        <StatsTable entries={entries} />
      </div>
    </div>
  )
}
