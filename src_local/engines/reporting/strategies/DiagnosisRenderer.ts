/**
 * 🩺 DiagnosisRenderer — specialized in rendering pillars and quality detailing.
 */
export class DiagnosisRenderer {
    static render(breakdown: any, getStatusBadge: (s: string) => string, formatQualityMetrics: (b: any) => string[]): string {
        const pillars = [
            { name: "Stability", val: breakdown["Stability (Coverage)"] || 0, max: 40, desc: "Cobertura de Testes" },
            { name: "Purity", val: breakdown["Purity (Complexity)"] || 0, max: 20, desc: "Complexidade Média" },
            { name: "Observability", val: breakdown["Observability (Telemetry)"] || 0, max: 15, desc: "Telemetria" },
            { name: "Security", val: breakdown["Security (Vulnerabilities)"] || 0, max: 15, desc: "Vulnerabilidades" },
            { name: "Excellence", val: breakdown["Excellence (Documentation)"] || 0, max: 10, desc: "Documentação" },
        ];

        let content = "### 🩺 DIAGNÓSTICO DE SAÚDE (PILARES E QUALIDADE)\n\n| Pilar | Score | Máx | Status | Impacto |\n| :--- | :---: | :---: | :--- | :--- |\n";
        for (const p of pillars) {
            content += `| ${p.name} | \`${Math.round(p.val)}\` | ${p.max} | ${getStatusBadge(p.val > (p.max * 0.7) ? "OK" : "ALERTA")} | ${p.desc} |\n`;
        }
        return content + "\n#### 📐 Detalhamento de Métricas de Qualidade\n\n" + formatQualityMetrics(breakdown).join("\n");
    }
}
