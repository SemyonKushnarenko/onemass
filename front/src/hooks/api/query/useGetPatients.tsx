import { useQuery } from "@tanstack/react-query";
import useFetch from "../useFetch";
import type { MoodEntry } from "../../../lib/types";

export type PatientDto = {
  id: string
  username?: string
  firstName?: string
  telegramId?: string
  subscriptionActive?: boolean
  moods?: MoodEntry[]
}

export default function useGetPatients() {
  return useQuery<PatientDto[]>({
    queryKey: ['patients'],
    queryFn: () =>
      useFetch<PatientDto[]>('/psychologist/patients').then((list) =>
        list.map((p) => ({
          ...p,
          moods: (p.moods || [])
            .map((m) => ({
              ...m,
              mood: (m as any).mood ?? (m as any).value,
              date: m.date ?? m.createdAt,
            }))
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            ),
        })),
      ),
    staleTime: 60_000,
  })
}