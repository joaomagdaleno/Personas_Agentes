import winston from "winston";
import { BattlePlanSectionsEngine } from "./battle_plan_sections_engine.ts";

const logger = winston.child({ module: "BattlePlanFormatter" });

/**
 * 🎯 BattlePlanFormatter — PhD in Recovery Roadmaps
 * Especialista em estruturar diretrizes de engenharia.
 */
export class BattlePlanFormatter {
    private engine: BattlePlanSectionsEngine;

    constructor() {
        this.engine = new BattlePlanSectionsEngine();
    }

    format(auditResults: any[]): string {
        const active = this.engine.filterActiveResults(auditResults, this.getItemKey);
        if (active.length === 0) {
            return "## 🎯 PLANO DE BATALHA\n\n> ✅ Nenhuma intervenção necessária.";
        }

        const categories = this.groupBySeverity(active);
        const sections: string[] = [
            "## 🎯 PLANO DE BATALHA: DIRETRIZES DE ENGENHARIA",
            this.formatImpactSummary(categories),
            "---"
        ];

        const priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "STRATEGIC"];
        for (const sev of priorities) {
            const section = this.formatSectionIfActive(sev, categories[sev] || []);
            if (section) sections.push(section);
        }

        return sections.map(s => s.trim()).filter(s => s !== "").join("\n\n").trim();
    }

    private formatSectionIfActive(sev: string, items: any[]): string {
        if (!items || items.length === 0) return "";
        return this.engine.formatSeverityGroup(sev, items, this.formatItem.bind(this));
    }

    private getItemKey(item: any): string {
        if (typeof item === 'object' && item !== null) {
            const issue = (item.issue || '').toString().replace(/\.$/, '');
            return `${item.file}:${item.line || '0'}:${issue}`;
        }
        return item.toString().replace(/\.$/, '');
    }

    private groupBySeverity(activeItems: any[]): Record<string, any[]> {
        const cats: Record<string, any[]> = {
            "CRITICAL": [], "HIGH": [], "MEDIUM": [], "LOW": [], "STRATEGIC": []
        };

        for (const item of activeItems) {
            if (item && typeof item === 'object') {
                const sevKey = (item.severity || 'MEDIUM').toUpperCase();
                const list = cats[sevKey];
                if (list) {
                    list.push(item);
                } else {
                    cats["MEDIUM"].push(item);
                }
            } else {
                cats["STRATEGIC"].push(item);
            }
        }
        return cats;
    }

    private formatImpactSummary(cats: Record<string, any[]>): string {
        let res = "### 📊 RESUMO DE INTERVENÇÕES\n\n| Severidade | Quantidade |\n| :--- | :---: |\n";
        const order = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "STRATEGIC"];
        for (const s of order) {
            const list = cats[s];
            if (list && list.length > 0) {
                res += `| ${s} | ${list.length} |\n`;
            }
        }
        return res.trim();
    }

    private formatItem(item: any, sev: string): string {
        if (typeof item !== 'object' || item === null) {
            return `- **Diretriz Estratégica:** ${item.toString().replace(/\.$/, '').trim()}\n\n`;
        }

        const issueClean = (item.issue || '').toString().replace(/\.$/, '').trim();
        const line = item.line || 'N/A';
        const fileId = (item.file || '').replace(/\./g, '_').replace(/[\\/]/g, '/');

        let res = `#### 🔴 Item ${line}: ${issueClean} [ID: ${fileId}_${line}]\n\n`;

        if (item.snippet) {
            res += `- **Evidência:**\n\n\`\`\`typescript\n${item.snippet.trim()}\n\`\`\`\n\n`;
        }

        if (item.ai_insight) {
            res += `> 🧠 **TestRefiner (AI Insight):**\n> ${item.ai_insight.replace(/\n/g, '\n> ')}\n\n`;
        }

        return res + `- **Diretriz:** Padrão soberano de ${sev.toLowerCase()}\n\n`;
    }
}
