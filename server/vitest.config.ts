import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    env: { NODE_ENV: 'test' },
    testTimeout: 20000,
    hookTimeout: 30000,
    fileParallelism: false, // beberapa file test memakai database in-memory yang sama, hindari race condition
  },
})
