import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './globals.css'
import App from './App.tsx'
import './config/i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback="Loading...">
    <App />
    </Suspense>
  </StrictMode>,
)
