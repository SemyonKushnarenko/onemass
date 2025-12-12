import type { Patient, MoodEntry } from './types'

const STORAGE_KEY = 'mental_health_app_data'

export const generateMockData = (): Patient[] => {
  const today = new Date()
  const patients: Patient[] = [
    {
      id: 'p1',
      name: 'Александр Иванов',
      status: 'active',
      entries: Array.from({ length: 15 })
        .map((_, i) => {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          return {
            id: `e1-${i}`,
            date: date.toISOString(),
            mood: Math.floor(Math.random() * 5 + 1) as any,
            comment:
              i % 3 === 0 ? 'Чувствую себя немного лучше сегодня.' : undefined,
          }
        })
        .reverse(),
    },
    {
      id: 'p2',
      name: 'Мария Петрова',
      status: 'active',
      entries: Array.from({ length: 10 })
        .map((_, i) => {
          const date = new Date(today)
          date.setDate(date.getDate() - i * 2)
          return {
            id: `e2-${i}`,
            date: date.toISOString(),
            mood: Math.floor(Math.random() * 3 + 1) as any,
            comment: 'Тяжелый день.',
          }
        })
        .reverse(),
    },
    {
      id: 'p3',
      name: 'Дмитрий Сидоров',
      status: 'inactive',
      entries: [],
    },
  ]
  return patients
}

export const getPatients = (): Patient[] => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  const initial = generateMockData()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  return initial
}

export const savePatientEntry = (patientId: string, entry: MoodEntry) => {
  const patients = getPatients()
  const patientIndex = patients.findIndex((p) => p.id === patientId)

  if (patientIndex >= 0) {
    patients[patientIndex].entries.unshift(entry)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients))
    return patients
  }
  return patients
}

export const CURRENT_PATIENT_ID = 'p1'
