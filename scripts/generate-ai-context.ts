/**
 * 生成 AI 上下文脚本
 * 扫描路由配置和页面文件，生成 ai-context.json 和 ai-capabilities.json
 */
import * as fs from 'fs';
import * as path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const OUTPUT_PATH = path.join(ROOT_DIR, 'public', 'ai-context.json');
const CAPABILITIES_OUTPUT_PATH = path.join(ROOT_DIR, 'public', 'ai-capabilities.json');

interface AIElement {
    role?: string;
    action?: string;
    entity?: string;
    param?: string;
    desc?: string;
}

interface RouteConfig {
    path: string;
    page: string;
    title: string;
    elements: AIElement[];
    params: string[];
}

/**
 * 从路由路径中提取参数
 */
function extractParams(routePath: string): string[] {
    const params: string[] = [];
    const matches = routePath.match(/:(\w+)/g);
    if (matches) {
        matches.forEach(match => {
            params.push(match.slice(1));
        });
    }
    return params;
}

/**
 * 扫描文件中的 AI 语义属性元素
 */
function scanElementsFromFile(filePath: string): AIElement[] {
    const elements: AIElement[] = [];

    try {
        const content = fs.readFileSync(filePath, 'utf-8');

        // 找所有 data-ai-action 出现位置，然后提取完整元素
        const actionPositions: number[] = [];
        const actionRegex = /data-ai-action/g;
        let m;
        while ((m = actionRegex.exec(content)) !== null) {
            actionPositions.push(m.index);
        }

        for (const pos of actionPositions) {
            // 向前找开标签 <
            let start = pos;
            while (start > 0 && content[start] !== '<') {
                start--;
            }

            // 向后找闭合 >
            let end = pos;
            while (end < content.length && content[end] !== '>') {
                end++;
            }

            const elementStr = content.slice(start, end + 1);
            const element: AIElement = {};

            // 提取各个 data-ai-* 属性
            const roleMatch = elementStr.match(/data-ai-role[=:{]\s*["'{]([^"'}]+)["'}]/);
            const actionMatch = elementStr.match(/data-ai-action[=:{]\s*["'{]([^"'}]+)["'}]/);
            const entityMatch = elementStr.match(/data-ai-entity[=:{]\s*["'{`]([^"'}`]+)["'}`]/);
            const paramMatch = elementStr.match(/data-ai-param[=:{]\s*["'{]([^"'}]+)["'}]/);
            const descMatch = elementStr.match(/data-ai-desc[=:{]\s*["'{]([^"'}]+)["'}]/);

            if (roleMatch) {
                element.role = roleMatch[1];
            }
            if (actionMatch) {
                element.action = actionMatch[1];
            }
            if (entityMatch) {
                element.entity = entityMatch[1];
            }
            if (paramMatch) {
                element.param = paramMatch[1];
            }
            if (descMatch) {
                element.desc = descMatch[1];
            }

            if (element.action) {
                elements.push(element);
            }
        }
    } catch {
        console.warn(`无法读取文件: ${filePath}`);
    }

    return elements;
}

/**
 * 递归扫描目录中的所有 tsx 文件
 */
function scanDirectory(dir: string): Map<string, AIElement[]> {
    const result = new Map<string, AIElement[]>();

    function scan(currentDir: string) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                scan(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
                const elements = scanElementsFromFile(fullPath);
                if (elements.length > 0) {
                    const relativePath = path.relative(SRC_DIR, fullPath);
                    result.set(relativePath, elements);
                }
            }
        }
    }

    scan(dir);
    return result;
}

/**
 * 去重元素（基于 action + entity 组合）
 */
function dedupeElements(elements: AIElement[]): AIElement[] {
    const seen = new Set<string>();
    return elements.filter(el => {
        const key = `${el.action}:${el.entity || ''}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

/**
 * 生成路由配置
 */
function generateRoutes(elementsByFile: Map<string, AIElement[]>): RouteConfig[] {
    const routeMapping: Array<{ path: string; page: string; title: string; file: string; }> = [
        {
            path: '/app/applications',
            page: 'ApplicationsPage',
            title: '应用列表',
            file: 'pages/Applications/index.tsx',
        },
        {
            path: '/app/applications/:appId/overview',
            page: 'ApplicationOverview',
            title: '应用概览',
            file: 'pages/Applications/Overview/index.tsx',
        },
        {
            path: '/app/applications/:appId/deployments',
            page: 'DeploymentsPage',
            title: '部署管理',
            file: 'pages/Deployments/index.tsx',
        },
        {
            path: '/app/applications/:appId/settings',
            page: 'ApplicationSettings',
            title: '应用设置',
            file: 'pages/Applications/Settings/index.tsx',
        },
        {
            path: '/app/environments',
            page: 'EnvironmentsPage',
            title: '环境管理',
            file: 'pages/Environments/index.tsx',
        },
        {
            path: '/app/clusters',
            page: 'ClustersPage',
            title: '集群管理',
            file: 'pages/Clusters/index.tsx',
        },
        {
            path: '/app/accounts',
            page: 'AccountsPage',
            title: '账户管理',
            file: 'pages/Accounts/index.tsx',
        },
        {
            path: '/app/settings',
            page: 'SettingsPage',
            title: '用户设置',
            file: 'pages/Settings/index.tsx',
        },
    ];

    const routes: RouteConfig[] = [];

    for (const route of routeMapping) {
        const pageDir = path.dirname(route.file);
        const allElements: AIElement[] = [];

        for (const [filePath, elements] of elementsByFile) {
            if (filePath.startsWith(pageDir)) {
                allElements.push(...elements);
            }
        }

        routes.push({
            path: route.path,
            page: route.page,
            title: route.title,
            elements: dedupeElements(allElements),
            params: extractParams(route.path),
        });
    }

    return routes;
}

/**
 * 扫描能力文件，提取能力描述
 */
interface CapabilityInfo {
    name: string;
    description: string;
    params?: Record<string, { type: string; description: string; required?: boolean; }>;
}

function scanCapabilities(): CapabilityInfo[] {
    const capabilities: CapabilityInfo[] = [];
    const capabilitiesDir = path.join(SRC_DIR, 'capabilities');

    if (!fs.existsSync(capabilitiesDir)) {
        console.warn('能力目录不存在:', capabilitiesDir);
        return capabilities;
    }

    const files = fs.readdirSync(capabilitiesDir).filter(f =>
        f.endsWith('.ts') && f !== 'types.ts' && f !== 'index.ts'
    );

    for (const file of files) {
        const filePath = path.join(capabilitiesDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // 匹配能力定义块
        const capabilityRegex = /\{\s*name:\s*['"]([^'"]+)['"]\s*,\s*description:\s*['"]([^'"]+)['"]/g;
        let match;

        while ((match = capabilityRegex.exec(content)) !== null) {
            const capability: CapabilityInfo = {
                name: match[1],
                description: match[2],
            };

            // 尝试提取 params
            const afterMatch = content.slice(match.index, match.index + 500);
            const paramsMatch = afterMatch.match(/params:\s*\{([^}]+)\}/);
            if (paramsMatch) {
                const paramsStr = paramsMatch[1];
                const params: Record<string, { type: string; description: string; required?: boolean; }> = {};

                const paramRegex = /(\w+):\s*\{[^}]*type:\s*['"](\w+)['"]\s*,\s*description:\s*['"]([^'"]+)['"]/g;
                let paramMatch;
                while ((paramMatch = paramRegex.exec(paramsStr)) !== null) {
                    params[paramMatch[1]] = {
                        type: paramMatch[2],
                        description: paramMatch[3],
                        required: paramsStr.includes(`${paramMatch[1]}`) && paramsStr.includes('required: true'),
                    };
                }

                if (Object.keys(params).length > 0) {
                    capability.params = params;
                }
            }

            capabilities.push(capability);
        }
    }

    return capabilities;
}

/**
 * 主函数
 */
function main() {
    console.log('开始生成 AI 上下文...');
    console.log(`源目录: ${SRC_DIR}`);
    console.log(`输出路径: ${OUTPUT_PATH}`);

    const pagesDir = path.join(SRC_DIR, 'pages');
    const elementsByFile = scanDirectory(pagesDir);

    console.log(`扫描到 ${elementsByFile.size} 个包含 AI 元素的文件`);

    const routes = generateRoutes(elementsByFile);

    const output = {
        version: '1.0.0',
        routes,
    };

    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

    const totalElements = routes.reduce((sum, r) => sum + r.elements.length, 0);
    console.log('AI 上下文生成完成!');
    console.log(`路由数量: ${routes.length}`);
    console.log(`总元素数量: ${totalElements}`);

    // 生成能力描述文件
    console.log('\n开始生成能力描述...');
    const capabilities = scanCapabilities();

    const capabilitiesOutput = {
        version: '1.0.0',
        capabilities,
    };

    fs.writeFileSync(CAPABILITIES_OUTPUT_PATH, JSON.stringify(capabilitiesOutput, null, 2));
    console.log(`能力描述生成完成! 能力数量: ${capabilities.length}`);
}

main();
