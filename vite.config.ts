import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Firebase Hosting ke liye SPA fallback chahiye (react-router)
    target: 'es2022',
    sourcemap: false,
    // Firebase SDK ka chunk bhaari hota hai but alag se cache hota hai,
    // isliye warning ko silence karna theek hai.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Firebase SDK bhaari hai — alag chunk me rakhte hain taaki caching effective ho
        codeSplitting: {
          groups: [
            { name: 'firebase', test: /node_modules[\\/](@firebase|firebase|idb)[\\/]/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router)/ },
          ],
        },
      },
    },
  },
})