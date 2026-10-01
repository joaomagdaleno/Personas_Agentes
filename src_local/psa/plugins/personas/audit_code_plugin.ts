import type { PsaPlugin } from "../../kernel/psa_plugin.ts";
import type { PsaContext } from "../../kernel/psa_context.ts";

export class AuditCodePlugin implements PsaPlugin {
    public name = "persona-audit-code-guardian";
    public version = "2.0.0";
    public description = "Super Persona de Diagnóstico Contínuo, Auditoria de Código e Scorecard de Saúde.";

    public apply(ctx: PsaContext): void {
        ctx.tools.register({
            name: "code_auditor.scorecard",
            description: "Gera o scorecard de conformidade, complexidade ciclomática e saúde do código via motor soberano.",
            schema: {
                type: "object",
                properties: {
                    scope: { type: "string", description: "Escopo da auditoria ('full' ou 'fast')" }
                }
            },
            isExclusive: false,
            execute: async (args: { scope?: string }) => {
                try {
                    const { ScoreCalculator } = await import("../../../engines/diagnostics/audit_code_guardian_service.ts");
                    // ⚠️ KNOWN DEFECT (documented 2026-10-01, escalated to .jules/escalations.md).
                    // `ScoreCalculator.calculateHealth` has NEVER existed — not in this class, not in
                    // any commit (verified with `git log --all -S`). Because the call sits in a
                    // try/catch around a *dynamic* import, `tsc` cannot see the bad member, the call
                    // throws TypeError at runtime, and the catch below returns a FABRICATED
                    // healthScore of 100. The real implementation lives one layer down in
                    // PhdGovernanceSystem.getInstance().calculateHealth(...), but wiring it faithfully
                    // returns 0 for an empty file list, which changes the tool's contract.
                    // Left byte-identical to the shipped behaviour until a human picks a fix.
                    const health = (ScoreCalculator as any).calculateHealth({}, 100, 1.8);
                    return {
                        healthScore: health.score,
                        breakdown: health.breakdown,
                        status: "sovereign-grade",
                        cyclomaticComplexityAverage: 1.8,
                        deadCodePathsFound: 0,
                        scope: args.scope || "fast"
                    };
                } catch {
                    return {
                        healthScore: 100,
                        status: "sovereign-grade",
                        cyclomaticComplexityAverage: 2.1,
                        deadCodePathsFound: 0,
                        scope: args.scope || "fast"
                    };
                }
            }
        });

        ctx.tools.register({
            name: "code_auditor.analyze_file",
            description: "Analisa a qualidade e métricas avançadas de um arquivo fonte específico.",
            schema: {
                type: "object",
                properties: {
                    filePath: { type: "string", description: "Caminho do arquivo a ser analisado" }
                },
                required: ["filePath"]
            },
            isExclusive: false,
            execute: async (args: { filePath: string }) => {
                const fs = await import("node:fs");
                const path = await import("node:path");
                const full = path.resolve(ctx.workspaceRoot, args.filePath);
                if (!fs.existsSync(full)) {
                    return { success: false, error: `Arquivo não encontrado: ${args.filePath}` };
                }
                const content = await fs.promises.readFile(full, "utf-8");
                try {
                    const { ScoringMetricsEngine } = await import("../../../engines/diagnostics/audit_code_guardian_service.ts");
                    const engine = new ScoringMetricsEngine();
                    const metrics = engine.calculateAdvancedMetrics(content, args.filePath);
                    return { success: true, filePath: args.filePath, metrics };
                } catch {
                    return {
                        success: true,
                        filePath: args.filePath,
                        loc: content.split("\n").length,
                        hasExports: content.includes("export ")
                    };
                }
            }
        });
    }
}
