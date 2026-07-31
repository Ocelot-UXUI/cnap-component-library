import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/**/*.test.{ts,tsx}'],
        environment: 'jsdom',
        passWithNoTests: true,
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
