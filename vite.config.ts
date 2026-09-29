import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite(), react(), tailwindcss()],
  // lottie-react v3 imports three engine entry points (full, light, svg).
// Use exact-match aliases so engine subpaths resolve to the real files while
// the bare `lottie-web` import keeps the lighter `lottie_light` build.
  resolve: {
    alias: [
      { find: /^lottie-web\/build\/player\/lottie_svg\.js$/, replacement: 'lottie-web/build/player/lottie_svg.js' },
      { find: /^lottie-web\/build\/player\/lottie_light\.js$/, replacement: 'lottie-web/build/player/lottie_light.js' },
      { find: /^lottie-web$/, replacement: 'lottie-web/build/player/lottie_light' },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
})
