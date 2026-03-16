/**
 * 🧠 InsightSabedoriaFormatter — Helper for BriefingAgent report formatting.
 */
export class InsightSabedoriaFormatter {
    static format(insights: any[]): string {
        let md = "## 🧠 Sabedoria Noturna (Insights)\n";
        if (insights.length === 0) {
            return md + "*Nenhum insight profundo gerado. O sistema pode não ter entrado em modo ocioso prolongado.*\n";
        }

        for (const row of insights) {
            const icon = row.mode === "KILL" ? "🧹" : row.mode === "DEEP" ? "💡" : "📝";
            const badge = row.impact_level === "HIGH" ? "**[HIGH]**" : "";
            const time = (row.timestamp || "").substring(11, 16);
            md += `### ${icon} ${time} - ${badge}\n${row.insight}\n\n`;
        }
        return md;
    }
}
