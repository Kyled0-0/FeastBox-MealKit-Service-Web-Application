import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    // Server has its own vitest config with a Node env, real Prisma client,
    // and dedicated env-var loading. Root vitest is frontend-only; use the
    // root package.json `test:server` script to run backend tests.
    // Local-only directories (per CLAUDE.md commit rules) are also excluded
    // as a defensive guard in case a future note inside them happens to
    // match the *.test.js pattern.
    //
    // Explicit list (not `[...configDefaults.exclude, ...]`) for transparency:
    // any reader can see exactly what is excluded without consulting Vitest's
    // version-pinned defaults. Re-evaluate if Vitest grows new default patterns
    // (e.g. coverage/, cypress/) that we'd want to inherit automatically.
    exclude: [
      'node_modules/**',
      'dist/**',
      'server/**',
      'docs_foundation/**',
      'docs/superpowers/**',
      'Plan_ORG/**',
      '.claude/**'
    ]
  }
})
