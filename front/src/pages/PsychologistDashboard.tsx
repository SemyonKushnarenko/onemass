import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, AlertCircle, FileText, Plus, Copy, Check } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { formatShortDate, getMoodValue } from '../lib/utils'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import useGetPatients from '../hooks/api/query/useGetPatients'
import useAddPatient from '../hooks/api/mutation/useAddPatient'

export function PsychologistDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [invoiceLink, setInvoiceLink] = useState('')
  const [refCode, setRefCode] = useState('')
  const [copied, setCopied] = useState(false)
  const { data: patients = [], isLoading } = useGetPatients()
  const addPatient = useAddPatient()

  const stats = useMemo(() => {
    const active = patients.length
    const lowMood = patients.filter((p) => {
      const last = p.moods?.[0]
      return last && getMoodValue(last) <= 2
    }).length
    const entriesTotal = patients.reduce(
      (acc, p) => acc + (p.moods?.length ?? 0),
      0,
    )
    return { active, lowMood, entriesTotal }
  }, [patients])

  const handleAddPatient = async () => {
    const res = await addPatient.mutateAsync()
    setInvoiceLink(res.invoiceUrl)
    setRefCode(res.referral.refCode)
    setIsModalOpen(true)
    if ((window as any)?.Telegram?.WebApp?.openInvoice) {
      ;(window as any).Telegram.WebApp.openInvoice(res.invoiceUrl)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invoiceLink || refCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Кабинет психолога</h1>
        <Button onClick={handleAddPatient} className="gap-2" disabled={addPatient.isPending}>
          <Plus className="w-4 h-4" />
          {addPatient.isPending ? 'Создаём счёт...' : 'Добавить пациента'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Активные пациенты
              </p>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.active}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Низкое настроение
              </p>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.lowMood}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Всего записей</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.entriesTotal}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Список пациентов
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <div className="text-gray-500">Загрузка...</div>
          ) : (
            patients.map((patient) => (
              <Link key={patient.id} to={`/psychologist/patient/${patient.id}`}>
                <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {patient.firstName ||
                            patient.username ||
                            `Пациент ${patient.id.slice(0, 6)}`}
                        </h3>
                        <p className="text-xs text-gray-500">ID: {patient.id}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          patient.subscriptionActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {patient.subscriptionActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="text-sm text-gray-500">
                        Последняя запись: <br />
                        <span className="font-medium text-gray-900">
                          {patient.moods && patient.moods.length > 0
                            ? formatShortDate(patient.moods[0].date)
                            : 'Нет записей'}
                        </span>
                      </div>

                      {patient.moods && patient.moods.length > 0 && (
                        <div className="h-12 w-24">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={[...patient.moods].reverse().slice(-7)}
                            >
                              <Line
                                type="monotone"
                                dataKey="mood"
                                stroke="#4A90E2"
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Добавить пациента"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Ссылка открывает оплату 10 Stars и активирует реферал {refCode}.
          </p>

          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={invoiceLink || 'Генерация ссылки...'}
              className="font-mono text-sm bg-gray-50"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={copyToClipboard}
              disabled={!invoiceLink}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Закрыть
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
