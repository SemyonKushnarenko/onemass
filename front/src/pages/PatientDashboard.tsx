import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart2, ChevronRight, Clock } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Textarea } from '../components/ui/Textarea'
import { MoodSelector } from '../components/MoodSelector'
import type { MoodValue } from '../lib/types'
import { formatDate, cn, getMoodValue } from '../lib/utils'
import useMoodList from '../hooks/api/query/useMoodList'
import useSubmitMood from '../hooks/api/mutation/useSubmitMood'
import useSubscribe from '../hooks/api/mutation/useSubscribe'
import { useAuth } from '../lib/auth'

export function PatientDashboard() {
  const [mood, setMood] = useState<MoodValue | null>(null)
  const [comment, setComment] = useState('')
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
  const { data: entries = [], isLoading } = useMoodList()
  const submit = useSubmitMood()
  const subscribe = useSubscribe()
  const { user } = useAuth()

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [entries],
  )

  const handleSubmit = async () => {
    if (!mood) return
    await submit.mutateAsync({
      value: mood,
      comment: comment.trim() || undefined,
    })
    setMood(null)
    setComment('')
  }

  const handleSubscribe = async () => {
    const res = await subscribe.mutateAsync()
    if ((window as any)?.Telegram?.WebApp?.openInvoice) {
      ;(window as any).Telegram.WebApp.openInvoice(res.invoiceUrl)
    } else {
      window.open(res.invoiceUrl, '_blank')
    }
  }

  const getMoodColor = (value: number) => {
    switch (value) {
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Добро пожаловать</h1>
          <p className="text-gray-500 mt-1">Как вы себя чувствуете сегодня?</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${
              user?.subscriptionActive
                ? 'bg-blue-50 text-blue-700 ring-blue-700/10'
                : 'bg-amber-50 text-amber-700 ring-amber-700/10'
            }`}
          >
            {user?.subscriptionActive ? 'Подписка активна' : 'Нет подписки'}
          </span>
          <Link to="/patient/stats">
            <Button variant="outline" size="sm" className="gap-2">
              <BarChart2 className="w-4 h-4" />
              Статистика
            </Button>
          </Link>
        </div>
      </div>

      {!user?.subscriptionActive && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-amber-900">
              Доступ к отметкам настроения требует активной подписки.
            </div>
            <Button onClick={handleSubscribe} disabled={subscribe.isPending}>
              {subscribe.isPending ? 'Открываем оплату…' : 'Оформить подписку'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-100 shadow-md">
        <CardHeader>
          <CardTitle>Отметить настроение</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <MoodSelector value={mood} onChange={setMood} />

          <div
            className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
            style={{
              display: mood ? 'block' : 'none',
            }}
          >
            <Textarea
              placeholder="Что повлияло на ваше настроение? (необязательно)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
            <Button
              onClick={handleSubmit}
              disabled={!mood || submit.isPending || !user?.subscriptionActive}
              className="w-full sm:w-auto"
            >
              {submit.isPending ? 'Сохранение...' : 'Сохранить запись'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500" />
          История записей
        </h2>

        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Загрузка...</div>
          ) : sortedEntries.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200 text-gray-500">
              Пока нет записей. Сделайте первую отметку выше!
            </div>
          ) : (
            sortedEntries.map((entry, index) => {
              const moodValue = getMoodValue(entry)
              return (
                <div
                  key={entry.id}
                  className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
                  onClick={() =>
                    setExpandedEntry(
                      expandedEntry === entry.id ? null : entry.id,
                    )
                  }
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="p-4 flex items-center gap-4">
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full flex-shrink-0',
                        getMoodColor(moodValue),
                      )}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(entry.date)}
                        </span>
                        <ChevronRight
                          className={cn(
                            'w-4 h-4 text-gray-400 transition-transform duration-200',
                            expandedEntry === entry.id && 'rotate-90',
                          )}
                        />
                      </div>
                      {entry.comment && (
                        <p className="text-sm text-gray-500 truncate group-hover:text-gray-700 transition-colors">
                          {entry.comment}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className={cn(
                      'bg-gray-50 px-4 overflow-hidden transition-all duration-300 ease-in-out',
                      expandedEntry === entry.id
                        ? 'max-h-40 py-4 border-t border-gray-100'
                        : 'max-h-0 py-0',
                    )}
                  >
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {entry.comment || (
                        <span className="italic text-gray-400">
                          Без комментария
                        </span>
                      )}
                    </p>
                    <div className="mt-2 text-xs text-gray-400">
                      Настроение: {moodValue}/5
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
