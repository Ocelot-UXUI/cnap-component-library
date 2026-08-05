/**
 * ESLint 配置 — 仅代码质量规则
 *
 * 职责分工：
 *   - dprint (dprint.json)  → 代码格式化（缩进、引号、分号、换行等）
 *   - ESLint (.eslintrc.cjs) → 代码质量（max-lines、react-hooks、eqeqeq、complexity 等）
 *
 * 强制约束：本文件不得包含任何格式化规则（indent、quotes、semi、comma-spacing 等），
 * 也不得 extend @typescript-eslint/stylistic 等含格式化规则的 shared config。
 * 格式化由 dprint 独占，引入重复的格式化规则会导致两个工具冲突。
 *
 * 详见 docs/context/conventions.md → Code Style 段落。
 */
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: [
        '@typescript-eslint',
        'react',
        'react-hooks',
        'route-links',
    ],
    settings: {
        react: {
            version: 'detect',
        },
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
    ],
    rules: {
        // --- 路由链接管理规则 ---
        'route-links/no-direct-route-import': 'error',
        'route-links/no-hardcoded-route-url': 'error',

        // --- 基础组件引用收敛 ---
        // 除设计系统实现层与主题基础设施外，禁止业务代码直接从 antd 引入；
        // 统一走 @/design（详见 docs/context/conventions.md）。
        'no-restricted-imports': [
            'error',
            {
                'paths': [
                    {
                        'name': 'antd',
                        'message': '禁止直接从 antd 引入，请改用 @/design（基础组件统一在 src/design 下实现与再导出）。',
                    },
                ],
                'patterns': [
                    {
                        'group': ['antd/*'],
                        'message': '禁止直接从 antd 子路径引入，请改用 @/design。',
                    },
                ],
            },
        ],

        // --- 代码质量规则 ---

        // 保持文件在 140 行以内
        'max-lines': [
            'warn',
            {
                'max': 140,
                'skipBlankLines': true,
                'skipComments': true,
            },
        ],

        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                'ignoreRestSiblings': true,
                'argsIgnorePattern': '^_',
                'varsIgnorePattern': '^_',
                'caughtErrorsIgnorePattern': '^_',
            },
        ],

        'react-hooks/exhaustive-deps': 'error',
        'eqeqeq': 'error',
        'no-useless-concat': 'error',
        'max-depth': 'error',
        'func-names': 'error',
        'react/no-danger': 'error',
        'prefer-spread': 'error',
        'prefer-promise-reject-errors': 'error',
        'no-param-reassign': 'error',
        'complexity': ['error', { 'max': 10 }],
        'guard-for-in': 'error',
        '@typescript-eslint/no-empty-interface': 'error',

        // --- 显式关闭的规则 ---
        '@typescript-eslint/restrict-plus-operands': 'off',
        '@typescript-eslint/member-ordering': 'off',
        'react/jsx-no-bind': 'off',
        'react/no-array-index-key': 'off',
        'no-unused-expressions': 'off',
        'no-negated-condition': 'off',
        'camelcase': 'off',
        'no-underscore-dangle': 'off',

        // react/recommended 默认开启的 react/react-in-jsx-scope 在 React 17+ 不需要
        'react/react-in-jsx-scope': 'off',
        // react/prop-types 在 TypeScript 项目中不需要
        'react/prop-types': 'off',
    },
    ignorePatterns: ['*.d.ts', 'node_modules', 'dist', '.eslintrc.cjs'],
    overrides: [
        {
            // API 接口声明与实体类型文件不限制行数
            files: ['src/api/**/*.ts', 'src/interface/entities/**/*.ts', 'src/**/*Machine.ts'],
            rules: {
                'max-lines': 'off',
            },
        },
        {
            // 设计系统实现层与主题基础设施：允许直接依赖 antd
            //   - src/design/**            基础组件的实现与再导出层
            //   - src/constants/**         主题 token / preset 派生
            //   - 应用根 ConfigProvider / theme 装配
            files: [
                'src/design/**',
                'src/constants/**',
                'src/index.tsx',
                'src/routers/AppLayout/index.tsx',
                'src/contexts/ThemeContext.tsx',
            ],
            rules: {
                'no-restricted-imports': 'off',
            },
        },
    ],
};
