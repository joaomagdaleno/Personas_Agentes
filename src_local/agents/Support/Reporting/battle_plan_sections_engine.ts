import winston from "winston";

const logger = winston.child({ module: "BattlePlanSectionsEngine" });

/**
 * 🚩 BattlePlanSectionsEngine — PhD in Report Structuring
 * Formata grupos de severidade e itens individuais.
 */
export class BattlePlanSectionsEngine {
    formatSeverityGroup(sev: string, items: any[], itemFormatter: (item: any, sev: string) => string): string {
        const startT = Date.now();

        let res = `## 🚩 NÍVEL: ${sev}\n\n`;
        const fileGroups: Record<string, any[]> = {};

        for (const item of items) {
            const fname = (typeof item === 'object' && item !== null) ? (item.file || 'Global') : "Sistêmico";
            if (!fileGroups[fname]) fileGroups[fname] = [];
            fileGroups[fname].push(item);
        }

        for (const [fname, group] of Object.entries(fileGroups)) {
            res += `### 📂 Alvo: \`${fname}\` [${sev}]\n\n`;
            for (const item of group) {
                res += itemFormatter(item, sev);
            }
        }

        const duration = Date.now() - startT;
        logger.debug(`Telemetry: Formatted ${sev} group in ${duration}ms`);
        return res.trim();
    }

    filterActiveResults(auditResults: any[], keyGen: (item: any) => string): any[] {
        const dedup: any[] = [];
        const seen = new Set<string>();

        for (const i of auditResults) {
            const key = keyGen(i);
            if (!seen.has(key)) {
                dedup.push(i);
                seen.add(key);
            }
        }

        return dedup.filter(i => {
            if (typeof i === 'object' && i !== null) {
                return i.severity !== 'HEALED';
            }
            return true;
        });
    }

    /** Parity: format_item_entry — Formats a single audit finding as a markdown entry. */
    format_item_entry(item: any, sev: string): string {
        const icon = sev === "CRITICAL" ? "🔴" : sev === "HIGH" ? "🟠" : sev === "MEDIUM" ? "🟡" : "🟢";
        const file = item?.file || "Global";
        const issue = item?.issue || String(item);
        return `- ${icon} **[${sev}]** \`${file}\`: ${issue}\n`;
    }
}
