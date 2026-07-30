import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { SearchProvider } from './context/SearchContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <BrowserRouter>
      <SearchProvider>
        <FavoritesProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </FavoritesProvider>
      </SearchProvider>
    </BrowserRouter>
  </StrictMode>,
)