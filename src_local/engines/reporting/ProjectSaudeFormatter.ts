/**
 * 📊 ProjectSaudeFormatter — Helper for BriefingAgent report formatting.
 */
export class ProjectSaudeFormatter {
    static format(projects: any[]): string {
        let md = "## 📡 Saúde dos Territórios (Projetos)\n";
        md += "| Projeto | Saúde Atual | Status |\n|---|---|---|\n";

        for (const p of projects) {
            const score = Math.round(p.health_score || 0);
            const status = score > 80 ? "✅ Estável" : score > 50 ? "⚠️ Atenção" : "🚨 Crítico";
            md += `| **${p.name || 'Unknown'}** | \`${score}%\` | ${status} |\n`;
        }
        return md + "\n";
    }
}
