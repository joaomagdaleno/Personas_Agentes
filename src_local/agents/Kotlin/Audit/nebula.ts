/**
 * ☁️ Nebula - PhD in Cloud Architecture (Kotlin)
 * Especialista em integração Firebase, segurança de segredos em build.gradle e soberania cloud mobile.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class NebulaPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nebula";
        this.emoji = "☁️";
        this.role = "PhD Cloud Architect";
        this.stack = "Kotlin";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
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
            };
        }
        return `PhD Cloud: Analisando infraestrutura e segurança de nuvem para ${objective}. Focando em gestão de segredos e escalabilidade mobile.`;
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

