import { useQuery } from "@tanstack/react-query";
import useFetch, { getInitData } from "../useFetch";
import type { BackendUser } from "../../../lib/types";

type InitResponse = { ok: boolean; user: BackendUser }

export default function useGetMe() {
  const initData = getInitData()

  return useQuery<InitResponse>({
    queryKey: ['me', initData],
    enabled: Boolean(initData),
    queryFn: () =>
      useFetch<InitResponse>('/auth/init', {
        method: 'POST',
        auth: false,
        body: { initData },
      }),
    staleTime: 5 * 60 * 1000,
  })
}