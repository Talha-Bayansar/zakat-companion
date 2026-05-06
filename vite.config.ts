import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tanstackStart(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
    }),
    react(),
  ],
})
