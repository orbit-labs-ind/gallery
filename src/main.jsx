import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import './theme-tokens.css'
import '@mantine/core/styles.css'
import '@mantine/carousel/styles.css'
import './index.css'
import App from './App.jsx'

// StrictMode re-runs effects twice in development only (never in production builds).
// Album/image API modules dedupe identical in-flight requests so the Network tab stays sane.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)

