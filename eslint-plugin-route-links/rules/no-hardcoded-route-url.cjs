/**
 * ESLint 规则：禁止在导航操作中使用硬编码路径字符串
 * 必须使用 @/routes 提供的 route 对象的 toUrl() 方法生成 URL
 */
const EXCLUDED_PATHS = [
    '/ai-debug',
    '/ai-chat',
    '/about',
    '/example',
    '/border-glow-demo',
    '/home',
];

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: '禁止在导航操作中使用硬编码路径字符串，必须使用 route.toUrl()',
            category: 'Best Practices',
            recommended: 'error',
        },
        schema: [],
    },
    create(context) {
        function getPathValue(arg) {
            if (arg.type === 'Literal' && typeof arg.value === 'string') {
                return arg.value;
            }
            if (arg.type === 'TemplateLiteral' && arg.quasis.length === 1 && arg.expressions.length === 0) {
                return arg.quasis[0].value.raw;
            }
            if (arg.type === 'TemplateLiteral' && arg.quasis[0]) {
                return arg.quasis[0].value.raw;
            }
            return null;
        }

        function isHardcodedPath(arg) {
            if (!arg) {
                return false;
            }
            // 字符串字面量以 / 开头
            if (arg.type === 'Literal' && typeof arg.value === 'string' && arg.value.startsWith('/')) {
                if (EXCLUDED_PATHS.includes(arg.value)) {
                    return false;
                }
                return true;
            }
            // 模板字符串以 / 开头
            if (
                arg.type === 'TemplateLiteral'
                && arg.quasis.some(q => q.type === 'TemplateElement' && q.value.raw.startsWith('/'))
            ) {
                return true;
            }
            return false;
        }

        function isCallToUrl(arg) {
            if (!arg || arg.type !== 'CallExpression') {
                return false;
            }
            const callee = arg.callee;
            if (callee.type !== 'MemberExpression' || callee.property.name !== 'toUrl') {
                return false;
            }
            return true;
        }

        function checkCallExpression(node) {
            if (node.callee.type !== 'MemberExpression') {
                return;
            }
            if (node.callee.object.type !== 'Identifier' || node.callee.object.name !== 'router') {
                return;
            }
            if (node.callee.property.name !== 'navigate') {
                return;
            }

            const args = node.arguments;
            if (args.length === 0) {
                return;
            }

            const firstArg = args[0];

            if (firstArg.type === 'Literal' && typeof firstArg.value === 'number') {
                return;
            }

            if (isCallToUrl(firstArg)) {
                return;
            }

            if (isHardcodedPath(firstArg)) {
                context.report({
                    node,
                    message: `禁止使用硬编码路径进行导航，请使用 route.toUrl() 生成 URL。`,
                });
            }
        }

        function checkJsxAttribute(node) {
            if (node.name?.type !== 'JSXIdentifier') {
                return;
            }
            if (node.name.name !== 'to') {
                return;
            }

            const value = node.value;

            if (value.type === 'JSXExpressionContainer') {
                const expr = value.expression;

                if (isCallToUrl(expr)) {
                    return;
                }

                if (expr.type === 'Identifier') {
                    return;
                }

                if (isHardcodedPath(expr)) {
                    context.report({
                        node,
                        message: `禁止使用硬编码路径，请使用 route.toUrl() 生成 URL。`,
                    });
                }
                return;
            }

            if (value.type === 'Literal' && typeof value.value === 'string' && value.value.startsWith('/')) {
                if (EXCLUDED_PATHS.includes(value.value)) {
                    return;
                }
                context.report({
                    node,
                    message: `禁止使用硬编码路径 "${value.value}"，请使用 route.toUrl() 生成 URL。`,
                });
            }
        }

        return {
            CallExpression: checkCallExpression,
            JSXAttribute: checkJsxAttribute,
        };
    },
};
