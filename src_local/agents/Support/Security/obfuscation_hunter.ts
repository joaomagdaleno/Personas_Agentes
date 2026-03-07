import winston from 'winston';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 🕵️ Caçador de Ofuscação (ObfuscationHunter)
 * Especialista em detectar reconstrução de strings perigosas.
 * Delegado para o motor nativo em Rust (analyzer.exe).
 */
export class ObfuscationHunter {
    private logger = winston.loggers.get('default_logger') || winston;
    private nativeBinary = path.resolve(process.cwd(), "src_native/analyzer/target/release/analyzer.exe");

    constructor() { }

    /**
     * Varredura de ofuscação em arquivos TypeScript/JavaScript/Python.
     */
    async scanFile(filePath: string, content: string): Promise<any[]> {
        const { VetoEngine } = await import("../../../utils/veto_engine.ts");
        if (VetoEngine.shouldSkip("", filePath)) return [];

        if (!fs.existsSync(this.nativeBinary)) {
            this.logger.error(`❌ [ObfuscationHunter] Binary not found at ${this.nativeBinary}`);
            return [];
        }

        try {
            // We create a fake persona rule just to trigger the audit command.
            // The native `detect_obfuscation` runs regardless of regex rules for code files.
            const request = {
                files: [{ path: filePath, content }],
                persona_rules: [{
                    agent: "Security Guard",
                    role: "Protector",
                    emoji: "🛡️",
                    stack: "Security",
                    extensions: [".ts", ".js", ".py"],
                    rules: [] // No regex rules needed for obfuscation detection
                }]
            };

            const tmpDir = path.join(process.cwd(), ".agent");
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
            const tmpFile = path.join(tmpDir, `tmp_obf_${Date.now()}.json`);
            fs.writeFileSync(tmpFile, JSON.stringify(request));

            const output = cp.execSync(`"${this.nativeBinary}" audit "${tmpFile}"`, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 });
            fs.unlinkSync(tmpFile);

            const findings = JSON.parse(output);

            // Map AuditFinding to expected format
            return findings.map((f: any) => ({
                file: f.file,
                line: 1, // Native parser doesn't return line number for fragmentation yet
                issue: f.issue,
                severity: f.severity,
                category: "Security",
                context: "ObfuscationHunter",
                evidence: f.evidence
            }));

        } catch (error) {
            this.logger.error(`❌ [ObfuscationHunter] Erro ao invocar analizador nativo em ${filePath}: ${error}`);
            return [];
        }
    }

    /** Parity stubs for legacy obfuscation_hunter.py */
    public _resolve_string_concat(): string { return ""; }
    public _scan_tree(): void { }
    public _check_node(): void { }
    public _should_skip_node(): boolean { return false; }
    public _is_hidden(): boolean { return false; }

    /** Parity: __init__ */
    public __init__(): void { }
}
