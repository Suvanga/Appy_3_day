import React, { createContext, useContext, useState } from 'react'
import { Auth0Provider as RealAuth0Provider, useAuth0 as realUseAuth0 } from '@auth0/auth0-react'

type MockAuth = {
  isAuthenticated: boolean
  isLoading: boolean
  loginWithRedirect: () => Promise<void> | void
  logout: (opts?: any) => void
  user?: any
}

const MockContext = createContext<MockAuth | null>(null)

export function Auth0Provider({ domain, clientId, children, authorizationParams }: any) {
  // If real Auth0 config is provided, use the real provider
  if (domain && clientId) {
    return (
      <RealAuth0Provider domain={domain} clientId={clientId} authorizationParams={authorizationParams}>
        {children}
      </RealAuth0Provider>
    )
  }

  // Otherwise provide a simple mock auth context for local testing
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [isLoading] = useState(false)

  const loginWithRedirect = async () => {
    setIsAuthenticated(true)
  }

  const logout = (_opts?: any) => {
    setIsAuthenticated(false)
  }

  const user = isAuthenticated ? { name: 'Demo User', email: 'demo@local' } : undefined

  return (
    <MockContext.Provider value={{ isAuthenticated, isLoading, loginWithRedirect, logout, user }}>
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
