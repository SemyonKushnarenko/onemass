const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:7214'

export const getInitData = () =>
  (window as any)?.Telegram?.WebApp?.initData ||
  import.meta.env.VITE_INIT_DATA ||
  ''

type FetchOptions = {
  method?: string
  body?: unknown
  auth?: boolean
  headers?: Record<string, string>
}

export default async function useFetch<T>(
  url: string,
  { method = 'GET', body = null, auth = true, headers = {} }: FetchOptions = {},
): Promise<T> {
  const initData = getInitData()

  const response = await fetch(`${API_URL}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && initData ? { Authorization: initData } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const text = await response.text()
    console.error(`API error ${response.status}: ${text}`)
    throw new Error(text || 'Request failed')
  }

  return response.json() as Promise<T>
}