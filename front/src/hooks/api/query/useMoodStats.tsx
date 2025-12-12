import { useQuery } from "@tanstack/react-query";
import useFetch from "../useFetch";

type MoodStats = {
  avgMonth: number | null
  avgYear: number | null
}

export default function useMoodStats() {
  return useQuery<MoodStats>({
    queryKey: ['mood-stats'],
    queryFn: () => useFetch<MoodStats>('/mood/stats'),
    staleTime: 60_000,
  })
}

