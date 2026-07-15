import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import './globals.css'
import './config/i18n'
import { LoadingFallback } from './components/LoadingFallback'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { FavoritesProvider } from '@/hooks/useFavorites'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Suspense fallback={<LoadingFallback />}>
        <FavoritesProvider>
          <RouterProvider router={router} />
        </FavoritesProvider>
      </Suspense>
    </Provider>
  </StrictMode>,
)

