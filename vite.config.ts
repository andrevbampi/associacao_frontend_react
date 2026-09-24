import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Porta alinhada ao CorsConfig do back-end Spring Boot
    // (allowedOrigins("http://localhost:4200")).
    port: 4200,
    strictPort: true,
  },
})
