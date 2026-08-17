import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_INLINE_ALL собирает сайт одним автономным файлом (для превью-артефакта):
// картинки и шрифты становятся data-URI, стили не разбиваются на части.
const inlineAll = !!process.env.VITE_INLINE_ALL

export default defineConfig({
  plugins: [react()],
  base: inlineAll ? './' : '/',
  build: {
    outDir: inlineAll ? 'dist-preview' : 'dist',
    cssCodeSplit: !inlineAll,
    assetsInlineLimit: inlineAll ? Number.MAX_SAFE_INTEGER : 4096,
  },
})
