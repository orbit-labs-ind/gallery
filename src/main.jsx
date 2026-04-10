import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import './theme-tokens.css'
import '@mantine/core/styles.css'
import './gallery-mantine-overrides.css'
import '@mantine/carousel/styles.css'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

// StrictMode re-runs effects twice in development only (never in production builds).
// Album/image API modules dedupe identical in-flight requests so the Network tab stays sane.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <div className="app-shell">
          <App />
        </div>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)

