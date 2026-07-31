import {readdirSync, readFileSync, statSync} from 'node:fs';
import {join, relative, sep} from 'node:path';
import ts from 'typescript';

const rootDir = process.cwd();
const srcDir = join(rootDir, 'src');

interface Finding {
    file: string;
    line: number;
    text: string;
}

function shouldSkipPath(filePath: string): boolean {
    const relativePath = relative(rootDir, filePath).split(sep).join('/');
    return relativePath.startsWith('src/capabilities/')
        || relativePath.includes('/__tests__/')
        || relativePath.endsWith('.test.ts')
        || relativePath.endsWith('.test.tsx');
}

function listSourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const fullPath = join(dir, name);
        const fileStat = statSync(fullPath);

        if (fileStat.isDirectory()) {
            return listSourceFiles(fullPath);
        }

        if (!/\.(ts|tsx)$/.test(fullPath) || shouldSkipPath(fullPath)) {
            return [];
        }

        return [fullPath];
    });
}

function isNavigateExpression(expression: ts.Expression): boolean {
    if (ts.isIdentifier(expression)) {
        return expression.text === 'navigate';
    }

    if (ts.isPropertyAccessExpression(expression)) {
        return expression.name.text === 'navigate';
    }

    return false;
}

function isToUrlCall(node: ts.Node): boolean {
    return ts.isCallExpression(node)
        && ts.isPropertyAccessExpression(node.expression)
        && node.expression.name.text === 'toUrl';
}

function inspectFile(file: string): Finding[] {
    const sourceText = readFileSync(file, 'utf8');
    const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true);
    const findings: Finding[] = [];

    function visit(node: ts.Node): void {
        if (ts.isCallExpression(node) && isNavigateExpression(node.expression)) {
            const [firstArg] = node.arguments;

            if (firstArg && isToUrlCall(firstArg)) {
                const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                findings.push({
                    file: relative(rootDir, file),
                    line: line + 1,
                    text: node.getText(sourceFile),
                });
            }
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return findings;
}

const findings = listSourceFiles(srcDir).flatMap(inspectFile);

if (findings.length > 0) {
    console.error('Found router internal navigation using toUrl(). Use toPath() instead.\n');

    findings.forEach((finding) => {
        console.error(`${finding.file}:${finding.line}`);
        console.error(`  ${finding.text}\n`);
    });

    process.exit(1);
}
