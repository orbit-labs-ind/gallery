import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      scope: '/',
      includeAssets: ['picpoint_logo.svg', 'pwa-192.png', 'pwa-512.png'],
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      manifest: {
        name: 'PicPoint',
        short_name: 'PicPoint',
        description: 'Photo galleries and shared albums',
        lang: 'en',
        theme_color: '#080b12',
        background_color: '#080b12',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        prefer_related_applications: false,
        categories: ['photo', 'social'],
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff,json}'],
        globIgnores: ['**/vite.svg'],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  optimizeDeps: {
    include: ['swiper/react', 'swiper/modules'],
  },
  server: {
    // ngrok uses a new hostname per tunnel; allow all so manifest + SW load over HTTPS tunnels.
    allowedHosts: true,
  },
  preview: {
    allowedHosts: true,
  },
})
