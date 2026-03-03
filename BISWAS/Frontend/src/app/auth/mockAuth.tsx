import { createContext, useContext, useState } from 'react'
import { Auth0Provider as RealAuth0Provider, useAuth0 as realUseAuth0 } from '@auth0/auth0-react'

type MockAuth = {
  isAuthenticated: boolean
  isLoading: boolean
  loginWithRedirect: () => Promise<void> | void
  logout: (opts?: any) => void
  user?: any
  getAccessTokenSilently: (opts?: any) => Promise<string> // <-- Added this
}

const MockContext = createContext<MockAuth | null>(null)

export function Auth0Provider({ domain, clientId, children, authorizationParams }: any) {
  if (domain && clientId) {
    return (
      <RealAuth0Provider domain={domain} clientId={clientId} authorizationParams={authorizationParams}>
        {children}
      </RealAuth0Provider>
    )
  }

  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [isLoading] = useState(false)

  const loginWithRedirect = async () => {
    setIsAuthenticated(true)
  }

  const logout = (_opts?: any) => {
    setIsAuthenticated(false)
  }

  // <-- Added this mock function
  const getAccessTokenSilently = async () => {
    return "mock-token-for-local-testing"
  }

  const user = isAuthenticated ? { sub: 'mock-auth0-id|123', name: 'Demo User', email: 'demo@local' } : undefined

  return (
    // <-- Added getAccessTokenSilently to the Provider value
    <MockContext.Provider value={{ isAuthenticated, isLoading, loginWithRedirect, logout, user, getAccessTokenSilently }}>
      {children}
    </MockContext.Provider>
  )
}

export function useAuth0() {
  const mock = useContext(MockContext)
  if (mock) return mock as any
  return realUseAuth0()
}

export default {
  Auth0Provider,
  useAuth0,
}