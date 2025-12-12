import { useMutation, useQueryClient } from "@tanstack/react-query";
import useFetch from "../useFetch";
import type { MoodEntry, MoodValue } from "../../../lib/types";

type SubmitPayload = { value: MoodValue; comment?: string | null }

export default function useSubmitMood() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SubmitPayload) =>
      useFetch<MoodEntry>('/mood/submit', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moods'] })
      queryClient.invalidateQueries({ queryKey: ['mood-stats'] })
    },
  })
}

