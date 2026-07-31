/**
 * Design Tokens 机器约束
 *
 * 规则（详见 docs/design/design-tokens.md）：
 * 1. 任何文件禁止 import from '@/constants/colors/base' 或使用已 @deprecated 的 `colors` / `myColors`。
 * 2. 任何 import 了 design token（@/constants/colors | radius | spacing | shadow | typography）
 *    的文件（"opt-in 文件"），禁止出现 hex（#RGB / #RRGGBB / #RRGGBBAA）或 rgb() / rgba() 字面量。
 * 3. 允许 palette / semantic / navigation / presets / typography 内部持有原子色值——这些是真源。
 *
 * 使用方式：
 *   yarn verify:design-tokens   # 失败时 exit 1
 */
import {readdirSync, readFileSync, statSync} from 'node:fs';
import {basename, join, relative, sep} from 'node:path';

import ts from 'typescript';

const rootDir = process.cwd();
const srcDir = join(rootDir, 'src');

interface Finding {
    file: string;
    line: number;
    message: string;
}

const ALLOWLIST_PREFIXES = [
    'src/constants/colors/',
    'src/constants/themes/',
    'src/constants/typography.ts',
    'src/constants/shadow.ts',
    'src/constants/radius.ts',
    'src/constants/spacing.ts',
];

const TOKEN_IMPORT_PREFIXES = [
    '@/constants/colors',
    '@/constants/radius',
    '@/constants/spacing',
    '@/constants/shadow',
    '@/constants/typography',
];

const DEPRECATED_IMPORT_NAMES = new Set(['colors', 'myColors']);
const DEPRECATED_IMPORT_SOURCE = '@/constants/colors/base';

// 短 hex (#fff / #fff0) 或长 hex (#ffffff / #ffffffff)
const HEX_PATTERN = /(?<![\w&])#[0-9a-fA-F]{3,8}\b/g;
// rgb() / rgba() 字面量（要求括号内有数字，避免匹配 rgba() 类型定义）
const RGB_PATTERN = /\brgba?\s*\(\s*\d/g;

function normalizePath(path: string): string {
    return path.split(sep).join('/');
}

function toRelativePath(path: string): string {
    return normalizePath(relative(rootDir, path));
}

function listSourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const fullPath = join(dir, name);
        const fileStat = statSync(fullPath);

        if (fileStat.isDirectory()) {
            return listSourceFiles(fullPath);
        }

        return /\.(ts|tsx)$/.test(fullPath) ? [fullPath] : [];
    });
}

function isAllowlisted(relativeFile: string): boolean {
    return ALLOWLIST_PREFIXES.some((prefix) => relativeFile.startsWith(prefix));
}

function isTestFile(file: string): boolean {
    const name = basename(file);
    return /\.(test|spec)\.tsx?$/.test(name) || file.includes(`${sep}__tests__${sep}`);
}

interface ImportInfo {
    optedIn: boolean;
    deprecated: Finding[];
}

function inspectImports(file: string, sourceFile: ts.SourceFile, relativeFile: string): ImportInfo {
    const info: ImportInfo = { optedIn: false, deprecated: [] };

    ts.forEachChild(sourceFile, (node) => {
        if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) {
            return;
        }

        const moduleName = node.moduleSpecifier.text;
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());

        if (moduleName === DEPRECATED_IMPORT_SOURCE) {
            info.deprecated.push({
                file: relativeFile,
                line: line + 1,
                message: `禁止从 '${DEPRECATED_IMPORT_SOURCE}' 引入 (@deprecated)。改用 semantic / palette / sidebar。`,
            });
            return;
        }

        if (TOKEN_IMPORT_PREFIXES.some((prefix) => moduleName === prefix || moduleName.startsWith(`${prefix}/`))) {
            info.optedIn = true;
        }

        if (
            moduleName === '@/constants/colors' && node.importClause?.namedBindings
            && ts.isNamedImports(node.importClause.namedBindings)
        ) {
            node.importClause.namedBindings.elements.forEach((element) => {
                const importedName = element.propertyName?.text ?? element.name.text;
                if (DEPRECATED_IMPORT_NAMES.has(importedName)) {
                    const { line: elementLine } = sourceFile.getLineAndCharacterOfPosition(element.getStart());
                    info.deprecated.push({
                        file: relativeFile,
                        line: elementLine + 1,
                        message: `禁止引入已 @deprecated 的 '${importedName}'。改用 semantic / palette / sidebar。`,
                    });
                }
            });
        }
    });

    return info;
}

function scanRawColorLiterals(
    file: string,
    sourceText: string,
    sourceFile: ts.SourceFile,
    relativeFile: string,
): Finding[] {
    const findings: Finding[] = [];

    const collect = (pattern: RegExp, label: string) => {
        const regex = new RegExp(pattern.source, pattern.flags);
        let match: RegExpExecArray | null;
        while ((match = regex.exec(sourceText)) !== null) {
            const { line } = sourceFile.getLineAndCharacterOfPosition(match.index);
            findings.push({
                file: relativeFile,
                line: line + 1,
                message: `发现原始 ${label} 颜色 '${match[0]}'，请改用 semantic / palette / sidebar token。`,
            });
        }
    };

    collect(HEX_PATTERN, 'hex');
    collect(RGB_PATTERN, 'rgb/rgba');

    return findings;
}

function inspectFile(file: string): Finding[] {
    const relativeFile = toRelativePath(file);

    if (isAllowlisted(relativeFile) || isTestFile(file)) {
        return [];
    }

    const sourceText = readFileSync(file, 'utf8');
    const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true);
    const importInfo = inspectImports(file, sourceFile, relativeFile);

    const findings: Finding[] = [...importInfo.deprecated];

    if (importInfo.optedIn) {
        findings.push(...scanRawColorLiterals(file, sourceText, sourceFile, relativeFile));
    }

    return findings;
}

const sourceFiles = listSourceFiles(srcDir);
const findings = sourceFiles.flatMap(inspectFile);

if (findings.length > 0) {
    console.error('Design tokens 违规:\n');
    findings.forEach((finding) => {
        console.error(`${finding.file}:${finding.line}`);
        console.error(`  ${finding.message}\n`);
    });
    console.error(`共 ${findings.length} 处违规。详见 docs/design/design-tokens.md。`);
    process.exit(1);
}

console.log('Design tokens 检查通过。');
