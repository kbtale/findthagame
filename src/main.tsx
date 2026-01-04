import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import './globals.css'
import App from './App.tsx'
import './config/i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Suspense fallback="Loading...">
        <App />
      </Suspense>
    </Provider>
  </StrictMode>,
)
