import { useMutation } from "@tanstack/react-query";
import useFetch from "../useFetch";

type AddPatientResponse = {
  invoiceUrl: string
  payload: string
  referral: { refCode: string }
}

export default function useAddPatient() {
  return useMutation<AddPatientResponse>({
    mutationFn: () => useFetch<AddPatientResponse>('/billing/add-patient', { method: 'POST' }),
  })
}

