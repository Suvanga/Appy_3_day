import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'

// Using your correct original file paths!
import App from './app/App'
import './styles/index.css'

// Add the "!" at the end so TypeScript knows these are strictly strings
const domain = import.meta.env.VITE_AUTH0_DOMAIN!;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID!;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE!;

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: audience, 
        }}
      >
        <App />
      </Auth0Provider>
    </React.StrictMode>
  )
} else {
  console.error('Root element not found: #root')
}