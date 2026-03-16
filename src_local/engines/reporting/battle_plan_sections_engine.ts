import winston from "winston";

const logger = winston.child({ module: "BattlePlanSectionsEngine" });

/**
 * 🚩 BattlePlanSectionsEngine — PhD in Report Structuring
 * Formata grupos de severidade e itens individuais.
 */
export class BattlePlanSectionsEngine {
    formatSeverityGroup(sev: string, items: any[], itemFormatter: (item: any, sev: string) => string): string {
        const startT = Date.now();
        const fileGroups = items.reduce((acc: any, item) => {
            const name = (item?.file) || "Sistêmico";
            (acc[name] ||= []).push(item);
            return acc;
        }, {});

        let res = `## 🚩 NÍVEL: ${sev}\n\n`;
        Object.entries(fileGroups).forEach(([fname, group]: any) => {
            res += `### 📂 Alvo: \`${fname}\` [${sev}]\n\n`;
            group.forEach((item: any) => res += itemFormatter(item, sev));
        });

        logger.debug(`Telemetry: Formatted ${sev} group in ${Date.now() - startT}ms`);
        return res.trim();
    }

    filterActiveResults(auditResults: any[], keyGen: (item: any) => string): any[] {
        const seen = new Set<string>();
        const dedup = auditResults.filter(i => {
            const key = keyGen(i);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        return dedup.filter(i => (i?.severity !== 'HEALED'));
    }

    /** Parity: format_item_entry — Formats a single audit finding as a markdown entry. */
    format_item_entry(item: any, sev: string): string {
        const icon = sev === "CRITICAL" ? "🔴" : sev === "HIGH" ? "🟠" : sev === "MEDIUM" ? "🟡" : "🟢";
        const file = item?.file || "Global";
        const issue = item?.issue || String(item);
        return `- ${icon} **[${sev}]** \`${file}\`: ${issue}\n`;
    }
}
