import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/**/*.test.{ts,tsx}'],
        environment: 'jsdom',
        passWithNoTests: true,
        setupFiles: ['src/test/setup.ts'],
        // coverage: {
        //     include: ['src/**/*.{ts,tsx}'],
        // },
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
});
