import {readdirSync, readFileSync, statSync} from 'node:fs';
import {basename, dirname, extname, join, relative, resolve, sep} from 'node:path';
import ts from 'typescript';

const rootDir = process.cwd();
const srcDir = join(rootDir, 'src');

interface Finding {
    file: string;
    message: string;
    line?: number;
}

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

function isComponentStyleFile(file: string): boolean {
    return basename(file).endsWith('.style.ts');
}

function getStyleComponentName(file: string): string {
    return basename(file).replace(/\.style\.ts$/, '');
}

function hasComponentEntry(styleFile: string, componentName: string): boolean {
    const componentDir = dirname(styleFile);
    const candidates = [
        join(componentDir, 'index.tsx'),
        join(componentDir, `${componentName}.tsx`),
    ];
    return candidates.some((file) => {
        try {
            return statSync(file).isFile();
        } catch {
            return false;
        }
    });
}

function resolveImportPath(importer: string, importPath: string): string | null {
    if (!importPath.startsWith('.')) {
        return null;
    }

    const resolvedBase = resolve(dirname(importer), importPath);
    const candidates = [
        resolvedBase,
        `${resolvedBase}.ts`,
        `${resolvedBase}.tsx`,
        join(resolvedBase, 'index.ts'),
        join(resolvedBase, 'index.tsx'),
    ];

    for (const candidate of candidates) {
        try {
            if (statSync(candidate).isFile()) {
                return candidate;
            }
        } catch {
            // Continue checking other candidate extensions.
        }
    }

    return null;
}

function inspectStyleFile(styleFile: string): Finding[] {
    const componentName = getStyleComponentName(styleFile);
    const componentDirName = basename(dirname(styleFile));
    const findings: Finding[] = [];

    if (componentDirName !== componentName) {
        findings.push({
            file: toRelativePath(styleFile),
            message: `Component style file must live in ./${componentName}/${componentName}.style.ts`,
        });
    }

    if (!hasComponentEntry(styleFile, componentName)) {
        findings.push({
            file: toRelativePath(styleFile),
            message:
                `Expected ${componentName}/index.tsx or ${componentName}/${componentName}.tsx next to the style file`,
        });
    }

    return findings;
}

function inspectImports(file: string, styleFiles: Set<string>): Finding[] {
    const sourceText = readFileSync(file, 'utf8');
    const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true);
    const findings: Finding[] = [];

    function visit(node: ts.Node): void {
        if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
            const resolvedImport = resolveImportPath(file, node.moduleSpecifier.text);
            if (resolvedImport && styleFiles.has(resolvedImport) && dirname(resolvedImport) !== dirname(file)) {
                const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                findings.push({
                    file: toRelativePath(file),
                    line: line + 1,
                    message: `Do not import component-internal style file ${
                        toRelativePath(resolvedImport)
                    } from outside its component directory`,
                });
            }
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return findings;
}

const sourceFiles = listSourceFiles(srcDir);
const styleFiles = sourceFiles.filter(isComponentStyleFile);
const styleFileSet = new Set(styleFiles);
const findings = [
    ...styleFiles.flatMap(inspectStyleFile),
    ...sourceFiles.flatMap(file => inspectImports(file, styleFileSet)),
];

if (findings.length > 0) {
    console.error('Found component style file rule violations.\n');

    findings.forEach((finding) => {
        const location = finding.line ? `${finding.file}:${finding.line}` : finding.file;
        console.error(`${location}`);
        console.error(`  ${finding.message}\n`);
    });

    process.exit(1);
}
