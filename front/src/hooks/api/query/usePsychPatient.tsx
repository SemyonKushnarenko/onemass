import { useQuery } from "@tanstack/react-query";
import useFetch from "../useFetch";
import type { MoodEntry } from "../../../lib/types";

export type PsychPatientDetail = {
  patient: {
    id: string
    username?: string
    firstName?: string
    telegramId?: string
  }
  moods: MoodEntry[]
}

export default function usePsychPatient(patientId?: string) {
  return useQuery<PsychPatientDetail>({
    queryKey: ['psych-patient', patientId],
    enabled: Boolean(patientId),
    queryFn: () =>
      useFetch<PsychPatientDetail>(`/psychologist/patient/${patientId}`).then(
        (resp) => ({
          ...resp,
          moods: (resp.moods || [])
            .map((m) => ({
              ...m,
              mood: (m as any).mood ?? (m as any).value,
              date: m.date ?? m.createdAt,
            }))
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            ),
        }),
      ),
    staleTime: 30_000,
  })
}

