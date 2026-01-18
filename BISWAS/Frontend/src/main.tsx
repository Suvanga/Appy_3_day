import * as React from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import './styles/index.css'

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} else {
  // If root element is missing, log to help debugging in dev
  // (prevents throwing at runtime and causing blank page)
  // eslint-disable-next-line no-console
  console.error('Root element not found: #root')
}
