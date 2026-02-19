import winston from "winston";
import { VitalsSection } from "./Sections/vitals_section";
import { QualitySection } from "./Sections/quality_section";
import { RoadmapSection } from "./Sections/roadmap_section";
import { ParitySection } from "./Sections/ParitySection.ts";
import { EntropySection } from "./Sections/EntropySection.ts";
import { VisibilitySection } from "./Sections/VisibilitySection.ts";

import { DiagnosisRenderer } from "./strategies/DiagnosisRenderer.ts";

const logger = winston.child({ module: "ReportSectionsEngine" });

/**
 * 📄 ReportSectionsEngine — Gerador de seções dinâmicas do relatório.
 */
export class ReportSectionsEngine {
    private vitalsRenderer = new VitalsSection();
    private qualityRenderer = new QualitySection();
    private roadmapRenderer = new RoadmapSection();
    private parityRenderer = new ParitySection();
    private entropyRenderer = new EntropySection();
    private visibilityRenderer = new VisibilitySection();

    protected _generateProgressBar(percent: number, length: number = 10): string {
        const rounded = Math.round(percent);
        const full = Math.round((rounded / 100) * length);
        const empty = Math.max(0, length - full);
        return `\`${"█".repeat(full)}${"░".repeat(empty)} ${rounded}%\``;
    }

    protected _getStatusBadge(status: string): string {
        const s = status.toUpperCase();
        if (s.includes("CRÍTICO") || s.includes("COLLAPSE") || s.includes("ERRO") || s === "CRITICAL" || s === "HIGH") return "🔴 `CRÍTICO`";
        if (s.includes("ALERTA") || s.includes("ATENÇÃO") || s.includes("RISCO") || s === "MEDIUM") return "🟡 `ATENÇÃO`";
        if (s.includes("SUCESSO") || s.includes("ESTÁVEL") || s.includes("OK")) return "🟢 `ESTÁVEL`";
        if (s === "STRATEGIC") return "🟣 `ESTRATÉGICO`";
        if (s === "LOW") return "⚪ `BAIXO`";
        if (s === "INFO") return "🔵 `INFO`";
        return "🔵 `NEUTRO`";
    }

    formatVitalsTable(healthData: any, label: string, status: string): string {
        return this.vitalsRenderer.render(healthData, label, status);
    }

    formatParityBoard(stats: any): string {
        return this.parityRenderer.render(stats);
    }

    formatRoadmap(healthData: any): string {
        return this.roadmapRenderer.render(healthData);
    }

    formatEntropyMap(mapData: Record<string, any>, limit: number = 200): string {
        return this.entropyRenderer.render(mapData, limit);
    }

    formatIntegratedDiagnosis(breakdown: any): string {
        return DiagnosisRenderer.render(breakdown, (s) => this._getStatusBadge(s), (b) => this.formatQualityMetrics(b));
    }

    formatVisibilityAnalysis(healthData: any): string {
        return this.visibilityRenderer.render(healthData, (s) => this._getStatusBadge(s));
    }

    formatGovernanceSection(healthData: any): string {
        const level = healthData.compliance_level || "SOVEREIGN";
        return [
            this.formatIntegratedDiagnosis(healthData.breakdown || {}),
            "",
            "### ⚖️ DIRETRIZES DE GOVERNANÇA PHD",
            "",
            `| Ativo | Nível | Status |\n| :--- | :--- | :--- |\n| \`SISTEMA-ALFA\` | 💎 \`${level}\` | ✅ \`LIBERADO\` |`,
            "",
            "**Diretrizes Ativas:**",
            ...(healthData.directives || ["Manter paridade absoluta", "Zero débito técnico"]).map((d: string) => `- ${d}`),
            ""
        ].join("\n");
    }

    formatQualityMetrics(breakdown: any): string[] {
        return this.qualityRenderer.render(breakdown);
    }

    formatTopologyMap(healthData: any): string {
        const t = healthData.topology || { branch: "main", tracking: "origin/main", isHealthy: true };
        return `| Segmento | Identificador | Bridge Status |\n| :--- | :--- | :--- |\n| **Active Branch** | \`${t.branch}\` | ${t.isHealthy ? "🟢 `SYNC-OK`" : "🔴 `SYNC-ERROR`"} |\n| **Upstream** | \`${t.tracking}\` | 🔗 \`CONECTADO\` |\n| **Phased Sync** | \`LUCID-DREAMING\` | ⚡ \`ACTIVE\` |\n`;
    }
}
