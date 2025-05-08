import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [ react() ],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // com essa chave 'popup/index' o Rollup vai criar dist/popup/index.html
        'popup/index': path.resolve(__dirname, 'src/popup/index.html'),
        background:  path.resolve(__dirname, 'src/background.ts'),
      },
      output: {
        entryFileNames: chunk =>
          chunk.name === 'background' ? 'background.js' : '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]'
      }
    }
  }
})
