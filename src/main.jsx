import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { MantineProvider } from '@mantine/core'; //added this

import '@mantine/core/styles.css';      //mentine ui styles
import '@mantine/carousel/styles.css';   //img slider..
import './index.css';

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
     
      <BrowserRouter>
       <MantineProvider> 
        <App />
        </MantineProvider>
      </BrowserRouter>

    </Provider>
  </StrictMode>,
)

