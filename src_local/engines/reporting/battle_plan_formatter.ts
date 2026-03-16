import winston from "winston";
import { BattlePlanSectionsEngine } from "./battle_plan_sections_engine.ts";
import { SeverityGrouper } from "./strategies/SeverityGrouper.ts";
import { PlanHeader } from "./strategies/PlanHeader.ts";
import { PlanItems } from "./strategies/PlanItems.ts";

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
        if (active.length === 0) return "## 🎯 PLANO DE BATALHA\n\n> ✅ Nenhuma intervenção necessária.";
        const categories = SeverityGrouper.group(active);
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


    private formatImpactSummary(cats: Record<string, any[]>): string {
        return PlanHeader.formatImpact(cats);
    }

    private formatItem(item: any, sev: string): string {
        return PlanItems.format(item, sev);
    }
}
