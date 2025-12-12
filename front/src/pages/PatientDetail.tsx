import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { StatsTable } from '../components/StatsTable'
import { MoodChart } from '../components/MoodChart'
import usePsychPatient from '../hooks/api/query/usePsychPatient'
import { getMoodValue } from '../lib/utils'

export function PatientDetail() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = usePsychPatient(id)

  if (isLoading) {
    return <div className="text-center py-12">Загрузка...</div>
  }
  if (!data) {
    return <div className="text-center py-12">Пациент не найден</div>
  }

  const avg =
    data.moods.length > 0
      ? (
          data.moods.reduce((acc, curr) => acc + getMoodValue(curr), 0) /
          data.moods.length
        ).toFixed(1)
      : '-'

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/psychologist">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {data.patient.firstName || data.patient.username || data.patient.id}
          </h1>
          <p className="text-sm text-gray-500">ID: {data.patient.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Динамика настроения</CardTitle>
            </CardHeader>
            <CardContent>
              <MoodChart data={data.moods} />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Все записи</h2>
            <StatsTable entries={data.moods} />
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Сводка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-gray-500">Всего записей</span>
                <p className="text-2xl font-bold">{data.moods.length}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">
                  Среднее (все время)
                </span>
                <p className="text-2xl font-bold">{avg}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Контакт</span>
                <div className="mt-1 text-sm text-gray-700">
                  @{data.patient.username || '—'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
