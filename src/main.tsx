import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import ErrorBoundary from './components/Common/ErrorBoundary.tsx'
import './index.css'

type InstallPromptWindow = Window & { collabosInstallPrompt?: Event }

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  ;(window as InstallPromptWindow).collabosInstallPrompt = event
})

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
