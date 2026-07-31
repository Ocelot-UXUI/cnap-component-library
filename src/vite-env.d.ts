/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
    readonly VITE_LLM_PROVIDER?: string;
    readonly VITE_DEEPSEEK_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
