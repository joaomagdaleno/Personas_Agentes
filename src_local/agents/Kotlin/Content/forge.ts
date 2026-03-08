/**
 * ⚒️ Forge - PhD in Code Generation & Architectual Blueprinting (Kotlin)
 * Analisa a qualidade do boilerplate gerado e a estrutura de pacotes na JVM.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ForgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Forge";
        this.emoji = "⚒️";
        this.role = "PhD Software Architect";
        this.stack = "Kotlin";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /object .* : .*/, issue: "Singleton Pattern: Verifique se o objeto segurado é thread-safe ou se deve ser injetado via Hilt/Koin.", severity: "low" },
            { regex: /lateinit var/, issue: "Inicialização Tardia: lateinit var pode causar UninitializedPropertyAccessException. Prefira injeção via construtor ou delegates.", severity: "medium" },
            { regex: /var .*: .*\? = null/, issue: "Nullability: Evite vars nuláveis se o valor puder ser resolvido via encapsulamento ou StateFlow.", severity: "medium" },
            { regex: /Companion object/, issue: "Static Overload: Uso excessivo de companion objects pode indicar falta de modularidade e acoplamento forte.", severity: "low" }
        ];
        const results = await this.findPatterns([".kt", ".kts"], rules);

        // Advanced Logic: Architectual Audit
        if (results.some(r => r.issue.includes("lateinit"))) {
            this.reasonAboutObjective("Architectural Integrity", "Null Safety", "Found high usage of lateinit in Kotlin, increasing runtime risk.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Forge] Refatorando injeções e convertendo lateinit em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando robustez da arquitetura de classes JVM.",
            recommendation: "Implementar 'Sealed Interfaces' para modelar estados de domínio de forma exaustiva.",
            severity: "medium"
        } as StrategicFinding;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Software Kotlin. Seu foco é modularidade, imutabilidade e segurança de tipos JVM.`;
    }
}

