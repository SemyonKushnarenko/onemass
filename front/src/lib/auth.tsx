import { createContext, useContext } from 'react'
import useGetMe from '../hooks/api/query/useGetMe'
import { getInitData } from '../hooks/api/useFetch'
import type { BackendUser } from './types'

type AuthContextValue = {
  user?: BackendUser
  initData: string
  isLoading: boolean
  error?: unknown
}

const AuthContext = createContext<AuthContextValue>({
  user: undefined,
  initData: '',
  isLoading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, error } = useGetMe()
  const initData = getInitData()

  return (
    <AuthContext.Provider
      value={{ user: data?.user, initData, isLoading, error }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

