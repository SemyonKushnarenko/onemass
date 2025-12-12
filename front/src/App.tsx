import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { PatientDashboard } from './pages/PatientDashboard'
import { PatientStats } from './pages/PatientStats'
import { PsychologistDashboard } from './pages/PsychologistDashboard'
import { PatientDetail } from './pages/PatientDetail'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './lib/auth'
const queryClient = new QueryClient()

function RoutedApp() {
  const { user, isLoading, error } = useAuth()

  if (isLoading) {
    return <div className="p-6 text-center text-gray-600">Загрузка...</div>
  }

  if (error || !user) {
    return (
      <div className="p-6 text-center text-red-600">
        Не удалось инициализировать приложение. Проверьте initData/ENV.
      </div>
    )
  }

  const defaultPath = user.role === 'psychologist' ? '/psychologist' : '/patient'

  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultPath} replace />} />
      <Route path="/patient" element={<PatientDashboard />} />
      <Route path="/patient/stats" element={<PatientStats />} />
      <Route path="/psychologist" element={<PsychologistDashboard />} />
      <Route path="/psychologist/patient/:id" element={<PatientDetail />} />
    </Routes>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <RoutedApp />
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}