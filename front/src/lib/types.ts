export type MoodValue = 1 | 2 | 3 | 4 | 5

export interface MoodEntry {
  id: string
  date: string
  mood?: MoodValue
  value?: MoodValue
  comment?: string
  createdAt?: string
}

export interface Patient {
  id: string
  name: string
  status: 'active' | 'inactive'
  entries: MoodEntry[]
}

export interface PsychologistStats {
  activePatients: number
  lowMoodCount: number
  totalEntries: number
}

export type UserRole = 'psychologist' | 'patient'

export interface BackendUser {
  id: string
  role: UserRole
  subscriptionActive: boolean
  username?: string
  firstName?: string
  telegramId?: string
  createdVia?: string
}
