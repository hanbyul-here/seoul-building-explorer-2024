import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // For Compare Control
  // https://github.com/vitejs/vite/issues/9703#issuecomment-1216662109
  build: {
    commonjsOptions: { include: [] },
  },
  optimizeDeps: {
    disabled: false,
  }
})
