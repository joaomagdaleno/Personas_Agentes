export class ReportFormatter {
    static format360(snapshot: any, findings: any[], sections: any, hotspotsFn: (s: any) => string, planFn: (f: any[]) => string): string {
        const lastCheck = new Date().toLocaleTimeString(), badge = (s: number) => sections["_getStatusBadge"](s > 80 ? "OK" : (s > 50 ? "ALERTA" : "CRÍTICO"));
        const sanity = snapshot.predictor_metrics || { score: 0, status: "Healthy", label: "✅ Sanidade Neural Nominal" };

        let report = `# 🏛️ RELATÓRIO SISTÊMICO: CONSOLIDAÇÃO DA REALIDADE\n\n`;
        report += `> **Status Operacional:** ${badge(snapshot.health_score)} | **Integridade Geral:** \`${Math.round(snapshot.health_score || 0)}%\`\n`;
        report += `> **Sanidade Neural:** \`${sanity.score.toFixed(4)}\` | **Estado:** ${sanity.label}\n`;
        report += `> **Ambiente:** \`TS-MASTER-CONTROL\` | **Último Check:** \`${lastCheck}\`\n> \n`;
        report += `> ${snapshot.health_score === 0 ? "💀 `SITUAÇÃO: COLAPSO DE INTEGRIDADE`" : "💎 `SITUAÇÃO: SOBERANIA TÉCNICA`"}\n\n---\n\n## 🧬 FLUXO DE DIAGNÓSTICO (CAUSA-RAIZ)\n\n${sections.formatGovernanceSection(snapshot)}\n\n---\n\n${hotspotsFn(snapshot)}\n---\n\n## 🔍 INTEGRIDADE E VISIBILIDADE\n\n${sections.formatVisibilityAnalysis(snapshot)}\n\n${sections.formatRoadmap(snapshot)}\n\n---\n\n## 🚩 PLANO DE BATALHA E ACHADOS ESTRATÉGICOS\n\n${planFn(findings)}\n\n`;

        if (findings.length > 0) {
            report += `### 🏷️ Achados Detalhados (Limitado a 10 por nível)\n\n`;
            const severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "STRATEGIC", "INFO"];
            let totalShown = 0;

            severities.forEach(sev => {
                const sub = findings.filter(f => (f.severity || '').toUpperCase() === sev);
                if (sub.length > 0) {
                    const limited = sub.slice(0, 10);
                    limited.forEach(f => {
                        totalShown++;
                        const fileName = (f.file || 'unknown').split(/[\\/]/).pop();
                        report += `> #### ${sections["_getStatusBadge"](f.severity)} [${totalShown}] \`${fileName}\`\n> - ${f.issue || f.message}\n>\n`;
                    });
                    if (sub.length > 10) {
                        report += `> *... e mais ${sub.length - 10} achados de nível ${sev} omitidos para brevidade.*\n>\n`;
                    }
                }
            });
        }
        return report;
    }
}
