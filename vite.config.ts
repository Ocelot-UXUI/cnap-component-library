import qiankun from '@tiny-codes/vite-plugin-qiankun';
import react from '@vitejs/plugin-react';
import * as process from 'process';
import {defineConfig, UserConfig} from 'vite';
import svgr from 'vite-plugin-svgr';

const buildTarget = ['chrome89', 'edge89', 'firefox89', 'safari15'];

// const isDev = process.env.NODE_ENV !== 'production';
// const CNAP_BASE_URL = isDev ? '/' : 'https://cnap2-sandbox.now.baidu-int.com/';
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const CNAP_BASE_URL = isGitHubPages
    ? '/cnap-component-library/'
    : process.env.FCNAP === 'true'
    ? `${process.env.FCNAP_CDN_HOST}/${process.env.FCNAP_CDN_PATH}`
    : 'https://cnap2-sandbox.now.baidu-int.com/';

const sharedConfig: UserConfig = {
    base: CNAP_BASE_URL,
    server: {
        port: 3000,
        strictPort: false,
        proxy: {
            // 代理到 CNAP 沙盒测试环境，与旧版 .env.development 保持一致
            '/api': {
                target: 'http://console.cloud-sandbox.baidu-int.com',
                changeOrigin: true,
                ws: true,
            },
        },
    },
    preview: {
        port: 4173,
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
};

const applicationConfig: UserConfig = {
    ...sharedConfig,
    build: {
        target: buildTarget,
        outDir: 'build',
        rollupOptions: {
            output: {
                assetFileNames: 'assets/[name].[hash:20][extname]',
                chunkFileNames: '[name].[hash:20].js',
                entryFileNames: '[name].[hash:20].js',
                hashCharacters: 'hex',
            },
        },
    },
    optimizeDeps: {
        include: [
            '@emotion/react',
            '@emotion/styled',
        ],
    },
    plugins: [
        react({
            jsxImportSource: '@emotion/react',
        }),
        svgr({
            include: '**/assets/icons/**/*.svg?react',
            svgrOptions: {
                replaceAttrValues: { '#545454': 'currentColor' },
            },
        }),
        svgr({
            include: '**/assets/illustrations/**/*.svg?react',
        }),
        qiankun('cnap'),
    ],
};

export default defineConfig(() => {
    return applicationConfig;
});
