import { useQuery } from "@tanstack/react-query";
import useFetch from "../useFetch";
import type { MoodEntry } from "../../../lib/types";

export default function useMoodList() {
  return useQuery<MoodEntry[]>({
    queryKey: ['moods'],
    queryFn: () =>
      useFetch<MoodEntry[]>('/mood/list').then((items) =>
        items
          .map((i) => ({
            ...i,
            mood: (i as any).mood ?? (i as any).value,
            date: i.date ?? i.createdAt,
          }))
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
      ),
    staleTime: 60_000,
  })
}

