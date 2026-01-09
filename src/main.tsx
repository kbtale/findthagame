import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import './globals.css'
import App from './App.tsx'
import './config/i18n'
import { LoadingFallback } from './components/LoadingFallback'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    </Provider>
  </StrictMode>,
)

