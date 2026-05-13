import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./test-utils/env.js'],
    passWithNoTests: true
  }
})
