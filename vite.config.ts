import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:7040',
        changeOrigin: true,
      },
      '/Hub': {
        target: 'http://127.0.0.1:7040',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('@firebase/auth') || id.includes('firebase/auth')) return 'firebase-auth'
          if (id.includes('@firebase/firestore') || id.includes('firebase/firestore')) return 'firebase-firestore'
          if (id.includes('@firebase/storage') || id.includes('firebase/storage')) return 'firebase-storage'
          if (id.includes('@firebase/app') || id.includes('firebase/app')) return 'firebase-app'
          if (id.includes('@firebase') || id.includes('firebase')) return 'firebase-vendor'
          if (id.includes('@livekit') || id.includes('livekit-client')) return 'livekit'
          if (id.includes('framer-motion')) return 'motion'
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('react-router-dom')) return 'router'
          if (id.includes('react') || id.includes('scheduler')) return 'react-vendor'
          return 'vendor'
        },
      },
    },
  },
})
