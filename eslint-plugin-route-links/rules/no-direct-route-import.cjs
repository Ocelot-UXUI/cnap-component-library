/**
 * ESLint 规则：禁止从 @/routes 子文件直接导入路由
 * 所有路由必须从统一出口 @/routes 导入
 */
module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: '禁止从 @/routes 子文件直接导入路由，必须从 @/routes 统一导入',
            category: 'Best Practices',
            recommended: 'error',
        },
        schema: [],
    },
    create(context) {
        return {
            ImportDeclaration(node) {
                const source = node.source.value;

                // 仅检查 @/routes/* 导入
                if (!source.startsWith('@/routes/') || source === '@/routes' || source === '@/routes/index') {
                    return;
                }

                // 允许导入工厂函数（开发者定义路由时需要）
                if (source === '@/routes/create') {
                    return;
                }

                context.report({
                    node,
                    message: `不允许从 "${source}" 直接导入路由，请从 "@/routes" 统一入口导入。`,
                });
            },
        };
    },
};
