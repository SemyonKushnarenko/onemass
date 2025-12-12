import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'
import { Activity, User, Users } from 'lucide-react'
import { useAuth } from '../lib/auth'

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { user } = useAuth()
  const isPsychologist = location.pathname.startsWith('/psychologist')
  return (
    <div className="min-h-screen bg-[#FAFAF9] font-sans text-gray-900">
      <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              MindTrack
            </span>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <Link
              to="/patient"
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2',
                !isPsychologist
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900',
              )}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Пациент</span>
            </Link>
            {user?.role === 'psychologist' && (
              <Link
                to="/psychologist"
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2',
                  isPsychologist
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900',
                )}
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Психолог</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  )
}
