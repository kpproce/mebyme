import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/mebyme/",
  // The base option only affects production builds. During development (npm run dev), Vite serves your app from the root (/).
  plugins: [react()],
})
