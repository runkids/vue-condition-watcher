import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    reporters: 'dot',
    setupFiles: [resolve(__dirname, './test/setup.ts')],
    deps: {
      inline: ['vue2', '@vue/composition-api', 'vue-demi'],
    },
  },
})
