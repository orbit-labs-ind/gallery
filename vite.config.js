import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['swiper/react', 'swiper/modules'],
  },
  server: {
    allowedHosts: ['ccd7-2401-4900-8fc4-fa0f-9d40-e440-d478-34b.ngrok-free.app'],
  }
})
