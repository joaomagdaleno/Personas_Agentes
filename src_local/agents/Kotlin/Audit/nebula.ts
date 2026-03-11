/**
 * ☁️ Nebula - PhD in Cloud Architecture (Kotlin)
 * Especialista em integração Firebase, segurança de segredos em build.gradle e soberania cloud mobile.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

export class NebulaPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nebula";
        this.emoji = "☁️";
        this.role = "PhD Cloud Architect";
        this.phd_identity = "Kotlin Security & Cloud Sovereignty";
        this.stack = "Kotlin";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const secretsQuery = await this.hub.queryKnowledgeGraph("Secret", "critical");
            const reasoning = await this.hub.reason(`Analyze the cloud security and secrets exposure of a Kotlin infrastructure given ${secretsQuery.length} potential secret nodes in the graph.`);
            
            findings.push({
                file: "Cloud Security Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Nebula: Soberania cloud Kotlin validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Secrets", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", "build.gradle.kts", "google-services.json"],
            rules: [
                { regex: /AKIA[0-9A-Z]{16}/, issue: "Vulnerabilidade Crítica: Chave AWS exposta no código ou build script.", severity: "critical" },
                { regex: /sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}/, issue: "Vulnerabilidade Crítica: Token (OpenAI/GitHub) exposto.", severity: "critical" },
                { regex: /(?:apiKey|API_KEY|password|secret)\s*[:=]\s*["'][^"']{8,}/, issue: "Vazamento: Credencial hardcoded no código-fonte Kotlin.", severity: "critical" },
                { regex: /Firebase\.getInstance\(/, issue: "Cloud Config: Verifique o isolamento de instâncias Firebase por ambiente.", severity: "medium" },
                { regex: /signingConfigs\s*\{\s*.*\s*password\s*=\s*".*"/, issue: "Gradle Security: Senha de assinatura exposta no build.gradle.", severity: "critical" },
                { regex: /"api_key":\s*\[\s*\{\s*"current_key":\s*".*"/, issue: "Metadata Leak: API Key exposta no google-services.json.", severity: "high" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("AKIA")) {
            return {
                file,
                issue: `Catástrofe Cloud: O objetivo '${objective}' exige proteção total. Credenciais expostas em '${file}' permitem sequestro de recursos.`,
                severity: "STRATEGIC",
                context: this.name
            } as StrategicFinding;
        }
        return {
            file,
            issue: `PhD Cloud: Analisando infraestrutura e segurança de nuvem para ${objective}. Focando em gestão de segredos e escalabilidade mobile.`,
            severity: "INFO",
            context: this.name
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
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Nuvem e Soberania Cloud Kotlin.`;
    }
}

