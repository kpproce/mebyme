import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/mebyme/",
  build: {
    target: 'es2015', // Zorgt ervoor dat moderne syntax zoals template literals herkend wordt
  },
  plugins: [react()],
})
