/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        exclude: ['**/t/**', '**/node_modules/**', '**/dist/**'],
        globals: true,
        environment: 'node',
    },
})
