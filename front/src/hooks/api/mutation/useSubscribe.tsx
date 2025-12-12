import { useMutation } from "@tanstack/react-query";
import useFetch from "../useFetch";

type SubscribeResponse = {
  invoiceUrl: string
  payload: string
  paymentId: string
}

export default function useSubscribe() {
  return useMutation<SubscribeResponse>({
    mutationFn: () =>
      useFetch<SubscribeResponse>('/billing/subscribe', {
        method: 'POST',
        body: { amountStars: 100 },
      }),
  })
}

