export class ReportFormatter {
    static format360(snapshot: any, findings: any, sections: any, hotspotsFn: (s: any) => string, planFn: (f: any[]) => string): string {
        const lastCheck = new Date().toLocaleTimeString(), badge = (s: number) => sections["_getStatusBadge"](s > 80 ? "OK" : (s > 50 ? "ALERTA" : "CRÍTICO"));
        let report = `# 🏛️ RELATÓRIO SISTÊMICO: CONSOLIDAÇÃO DA REALIDADE\n\n> **Status Operacional:** ${badge(snapshot.health_score)} | **Integridade Geral:** \`${Math.round(snapshot.health_score || 0)}%\`\n> **Ambiente:** \`TS-MASTER-CONTROL\` | **Último Check:** \`${lastCheck}\`\n> \n> ${snapshot.health_score === 0 ? "💀 `SITUAÇÃO: COLAPSO DE INTEGRIDADE`" : "💎 `SITUAÇÃO: SOBERANIA TÉCNICA`"}\n\n---\n\n## 🧬 FLUXO DE DIAGNÓSTICO (CAUSA-RAIZ)\n\n${sections.formatGovernanceSection(snapshot)}\n\n---\n\n${hotspotsFn(snapshot)}\n---\n\n## 🔍 INTEGRIDADE E VISIBILIDADE\n\n${sections.formatVisibilityAnalysis(snapshot)}\n\n${sections.formatRoadmap(snapshot)}\n\n---\n\n## 🚩 PLANO DE BATALHA E ACHADOS ESTRATÉGICOS\n\n${planFn(findings)}\n\n`;
        if (findings.length > 0) {
            report += `### 🏷️ Achados Detalhados\n\n`;
            findings.slice(0, 5).forEach((f: any, idx: number) => report += `> #### ${sections["_getStatusBadge"](f.severity)} [${idx + 1}] \`${f.file.split(/[\\/]/).pop()}\`\n> - ${f.issue || f.message}\n`);
            if (findings.length > 5) report += `>\n> ...total de \`${findings.length}\` achados monitorados.\n`;
        }
        return report;
    }
}
