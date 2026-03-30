import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: './', // Fixes 404s on relative paths
    server: {
        host: '127.0.0.1', // Bind to localhost only for security
        port: 5173,
        strictPort: false,
        open: false, // Don't auto-open browser for security
    },
    preview: {
        host: '127.0.0.1', // Bind to localhost only for security
        port: 4173,
        strictPort: false,
    }
})
