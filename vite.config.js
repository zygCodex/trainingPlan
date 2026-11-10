import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'
export default defineConfig({
  plugins: [vue(), {
    name: 'training-document',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'training-plan.md', source: readFileSync(new URL('./training-plan.md', import.meta.url), 'utf8') })
    },
  }],
  base: './',
})
