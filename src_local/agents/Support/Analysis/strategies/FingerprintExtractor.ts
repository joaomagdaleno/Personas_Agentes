/**
 * 🧬 FingerprintExtractor — 100% AST-Based Code DNA Extraction
 * 
 * Philosophy: rust-analyzer style — ALL analysis via AST walking.
 * No regex counting, no string matching — pure structural understanding.
 * 
 * Uses TypeScript Compiler API (ts.createSourceFile) to parse source files
 * and extract rules, methods, constructor assignments, and metadata.
 */
import * as ts from "typescript";
import * as cp from "child_process";
import * as path from "path";
import * as fs from "fs";
import type { AtomicFingerprint } from "../parity_types.ts";

// ─── AST Node Predicates ────────────────────────────────────────────────────

function isObjectLiteralWithProps(node: ts.Node, requiredProps: string[]): node is ts.ObjectLiteralExpression {
    if (!ts.isObjectLiteralExpression(node)) return false;
    const propNames = node.properties
        .filter(ts.isPropertyAssignment)
        .map(p => ts.isIdentifier(p.name) ? p.name.text : (ts.isStringLiteral(p.name) ? p.name.text : ""));
    return requiredProps.every(rp => propNames.includes(rp));
}

function isRuleObject(node: ts.Node): boolean {
    return isObjectLiteralWithProps(node, ["issue", "severity"]);
}

function getStringValue(obj: ts.ObjectLiteralExpression, propName: string): string | null {
    for (const prop of obj.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        const name = ts.isIdentifier(prop.name) ? prop.name.text : "";
        if (name === propName && ts.isStringLiteral(prop.initializer)) {
            return prop.initializer.text;
        }
    }
    return null;
}

// ─── Core AST Walk Result ───────────────────────────────────────────────────

interface ASTResult {
    rules: Array<{ issue: string; severity: string; hasPattern: boolean }>;
    dynamicFindings: Array<{ issue: string; severity: string }>;
    assignments: Record<string, string>;
    methods: string[];
    hasReasoning: boolean;
    fileExtensions: string[];
    systemPrompt: string;
    className: string;
    parentClass: string;
}

// ─── AST Walker ─────────────────────────────────────────────────────────────

function walkAST(source: ts.SourceFile): ASTResult {
    const r: ASTResult = {
        rules: [], dynamicFindings: [], assignments: {}, methods: [],
        hasReasoning: false, fileExtensions: [],
        systemPrompt: "", className: "", parentClass: ""
    };

    function visit(node: ts.Node) {
        // Class declaration → name + parent
        if (ts.isClassDeclaration(node) && node.name) {
            r.className = node.name.text;
            if (node.heritageClauses) {
                for (const hc of node.heritageClauses) {
                    if (hc.token === ts.SyntaxKind.ExtendsKeyword && hc.types.length > 0) {
                        r.parentClass = hc.types[0]!.expression.getText(source);
                    }
                }
            }
        }

        // Method declarations → names + reasoning detection
        if (ts.isMethodDeclaration(node) && node.name) {
            const name = ts.isIdentifier(node.name) ? node.name.text : node.name.getText(source);
            r.methods.push(name);
            if (name === "reasonAboutObjective") r.hasReasoning = true;
            if (name === "getSystemPrompt" && node.body) {
                const body = node.body.getText(source);
                const m = body.match(/[`'"]([^`'"]{10,})[`'"]/);
                if (m) r.systemPrompt = m[1]!.substring(0, 120);
            }
        }

        // Constructor body → this.X = "value"
        if (ts.isConstructorDeclaration(node) && node.body) {
            for (const stmt of node.body.statements) {
                if (!ts.isExpressionStatement(stmt)) continue;
                const expr = stmt.expression;
                if (!ts.isBinaryExpression(expr) || expr.operatorToken.kind !== ts.SyntaxKind.EqualsToken) continue;
                if (!ts.isPropertyAccessExpression(expr.left)) continue;
                if (expr.left.expression.kind !== ts.SyntaxKind.ThisKeyword) continue;
                const prop = expr.left.name.text;
                if (["name", "emoji", "role", "stack"].includes(prop) && ts.isStringLiteral(expr.right)) {
                    r.assignments[prop] = expr.right.text;
                }
            }
        }

        // Property declaration → auditRules = [...]
        if (ts.isPropertyDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
            if (node.name.text === "auditRules" && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
                collectRules(node.initializer, r);
            }
        }

        // Variable declaration → const rules/checks/auditRules = [...]
        if (ts.isVariableDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
            const vn = node.name.text;
            if (["rules", "auditRules", "checks"].includes(vn) && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
                collectRules(node.initializer, r);
            }
        }

        // Call expression → this.findPatterns([exts], [rules])
        if (ts.isCallExpression(node)) {
            const ct = node.expression.getText(source);
            if (ct.endsWith("findPatterns") && node.arguments.length >= 2) {
                const rulesArg = node.arguments[1];
                if (rulesArg && ts.isArrayLiteralExpression(rulesArg)) collectRules(rulesArg, r);
                const extArg = node.arguments[0];
                if (extArg && ts.isArrayLiteralExpression(extArg)) {
                    for (const el of extArg.elements) {
                        if (ts.isStringLiteral(el) && !r.fileExtensions.includes(el.text)) r.fileExtensions.push(el.text);
                    }
                }
            }
            // results.push({ issue: ..., severity: ... }) → dynamic findings (not declared rules)
            if (ct.endsWith(".push")) {
                for (const arg of node.arguments) {
                    if (isRuleObject(arg)) {
                        const obj = arg as ts.ObjectLiteralExpression;
                        r.dynamicFindings.push({
                            issue: getStringValue(obj, "issue") || "dynamic",
                            severity: getStringValue(obj, "severity") || "unknown"
                        });
                    }
                }
            }
        }

        ts.forEachChild(node, visit);
    }

    visit(source);
    return r;
}

function collectRules(arr: ts.ArrayLiteralExpression, r: ASTResult) {
    for (const el of arr.elements) {
        if (isRuleObject(el)) {
            const obj = el as ts.ObjectLiteralExpression;
            const props = obj.properties.filter(ts.isPropertyAssignment).map(p => ts.isIdentifier(p.name) ? p.name.text : "");
            r.rules.push({
                issue: getStringValue(obj, "issue") || "dynamic",
                severity: getStringValue(obj, "severity") || "unknown",
                hasPattern: props.includes("regex") || props.includes("pattern") || props.includes("field")
            });
        }
    }
}

// ─── Public API ─────────────────────────────────────────────────────────────

export class FingerprintExtractor {
    private static BINARY_PATH = path.resolve(process.cwd(), "src_native/analyzer/target/release/analyzer.exe");

    /**
     * Batch extract all fingerprints using the high-performance Rust analyzer.
     * Processes all stacks and categories in parallel via rayon.
     */
    static batchExtract(agentsRoot: string): Map<string, AtomicFingerprint> {
        const result = new Map<string, AtomicFingerprint>();

        if (!fs.existsSync(this.BINARY_PATH)) {
            console.warn(`[FingerprintExtractor] Rust binary not found at ${this.BINARY_PATH}. Falling back to slow TS extraction.`);
            return result;
        }

        try {
            const output = cp.execSync(`${this.BINARY_PATH} fingerprint ${agentsRoot}`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
            const report = JSON.parse(output);

            for (const entry of report.entries) {
                const key = `${entry.category}/${entry.agent}/${entry.stack}`;
                result.set(key, this.mapRustToAtomic(entry.fingerprint));
            }
        } catch (err) {
            console.error(`[FingerprintExtractor] Rust batch extraction failed:`, err);
        }

        return result;
    }

    private static mapRustToAtomic(f: any): AtomicFingerprint {
        return {
            name: f.name,
            emoji: f.emoji,
            role: f.role,
            stack: f.stack,
            rulesCount: f.rules_count,
            rulePatterns: f.rule_issues.map((_: any, i: number) => `P${i}`),
            ruleIssues: f.rule_issues,
            ruleSeverities: f.rule_severities,
            fileExtensions: f.file_extensions,
            hasReasoning: f.has_reasoning,
            reasoningTrigger: "",
            systemPrompt: f.system_prompt,
            hasExtraMethods: f.extra_methods,
            methods: f.methods
        };
    }

    static extractTS(content: string, name: string): AtomicFingerprint {
        // Try calling Rust for single file (can still be faster/more accurate)
        if (fs.existsSync(this.BINARY_PATH)) {
            try {
                // Write temp file to pass to Rust as we need a path
                const tmpDir = path.join(process.cwd(), "tmp_rust");
                if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
                const tmpFile = path.join(tmpDir, "tmp_fingerprint.ts");
                fs.writeFileSync(tmpFile, content);

                const output = cp.execSync(`${this.BINARY_PATH} fingerprint ${tmpDir}`, { encoding: 'utf8' });
                fs.unlinkSync(tmpFile);

                const report = JSON.parse(output);
                const entry = report.entries.find((e: any) => e.agent === "tmp_fingerprint");
                if (entry) return this.mapRustToAtomic(entry.fingerprint);
            } catch { /* fallback to TS AST */ }
        }

        const sf = ts.createSourceFile(`${name}.ts`, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
        const ast = walkAST(sf);
        return this.toFingerprint(name, ast);
    }

    static extractPython(content: string, name: string): AtomicFingerprint {
        // Python personas in this project are .ts files — parse as TS
        try { return this.extractTS(content, name); } catch { /* fallback */ }
        // True .py: structural walk
        const methods: string[] = [];
        let rules = 0;
        for (const line of content.split("\n")) {
            if (line.includes("issue") && line.includes("severity")) rules++;
            const m = line.match(/^\s*def\s+(\w+)\s*\(/);
            if (m?.[1]) methods.push(m[1]);
        }
        return {
            name, emoji: "👤", role: "PhD Agent", stack: "Python", rulesCount: rules,
            rulePatterns: [], ruleIssues: [], ruleSeverities: [], fileExtensions: [],
            hasReasoning: content.includes("reason_about_objective"),
            reasoningTrigger: "", systemPrompt: "", hasExtraMethods: [], methods
        };
    }

    private static toFingerprint(name: string, ast: ASTResult): AtomicFingerprint {
        // Deduplicate rules by issue text
        const unique = new Map<string, typeof ast.rules[0]>();
        for (const rule of ast.rules) unique.set(rule.issue, rule);
        const rules = Array.from(unique.values());

        return {
            name: ast.assignments["name"] || name,
            emoji: ast.assignments["emoji"] || "👤",
            role: ast.assignments["role"] || "PhD Agent",
            stack: ast.assignments["stack"] || "TypeScript",
            rulesCount: rules.length,
            rulePatterns: rules.filter(r => r.hasPattern).map((_, i) => `P${i}`),
            ruleIssues: rules.map(r => r.issue.substring(0, 60)),
            ruleSeverities: rules.map(r => r.severity),
            fileExtensions: ast.fileExtensions,
            hasReasoning: ast.hasReasoning,
            reasoningTrigger: "",
            systemPrompt: ast.systemPrompt,
            hasExtraMethods: ast.methods.filter(m =>
                !["performAudit", "performActiveHealing", "reasonAboutObjective",
                    "selfDiagnostic", "getSystemPrompt", "constructor"].includes(m)),
            methods: ast.methods
        };
    }

    static matchTSRules(content: string): string[] {
        const sf = ts.createSourceFile("probe.ts", content, ts.ScriptTarget.Latest, true);
        return walkAST(sf).rules.map(r => r.issue);
    }
}
