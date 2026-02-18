import { useState, useMemo } from "react";
import { extractSection, parseTable, deepClean } from "../utils.ts";

export const useDashboard = (mdContent: string) => {
    const [screen, setScreen] = useState('ops');

    const sections = useMemo(() => {
        return {
            sync: extractSection(mdContent, '## 🧬 SINCRONIA DE IDENTIDADE'),
            pillars: extractSection(mdContent, '### 📊 DECOMPOSIÇÃO DA SAÚDE \\(PILARES\\)'),
            vitals: extractSection(mdContent, '## 🩺 SINAIS VITAIS DO PRODUTO'),
            guidelines: extractSection(mdContent, '### ⚖️ DIRETRIZES DE GOVERNANÇA PHD'),
            roadmap: extractSection(mdContent, '### 🗺️ ROADMAP PARA 100%'),
            bridge: extractSection(mdContent, '## 🗺️ TOPOLOGIA DE SINCRONIA \\(NEURAL BRIDGE\\)'),
            entropy: extractSection(mdContent, '## 🌪️ MAPA DE ENTROPIA & ACOPLAMENTO'),
            matrix: extractSection(mdContent, '## 🧪 MATRIZ DE CONFIANÇA'),
            battle: extractSection(mdContent, '## 🎯 PLANO DE BATALHA: DIRETRIZES DE ENGENHARIA'),
            findings: mdContent.split('## 🚩 ACHADOS DETALHADOS')[1] || "",
            meta: {
                status: deepClean(mdContent.match(/\*\*Status Operacional:\*\*\s*(.*?)\n/)?.[1] || "OFFLINE"),
                compliance: deepClean(mdContent.match(/💎\s*(.*?)\s*\|/)?.[1] || "SOVEREIGN"),
                env: deepClean(mdContent.match(/\*\*Ambiente:\*\*\s*(.*?)\n/)?.[1] || "LOCAL"),
                situation: deepClean(mdContent.match(/💀\s*`(.*?)`/)?.[1] || "OPERACIONAL"),
                existentialRisk: deepClean(extractSection(mdContent, '## 💀 Risco Existencial'))
            }
        };
    }, [mdContent]);

    const global = useMemo(() => {
        const table = parseTable(sections.sync);
        const row = table.find(r => deepClean(r.Métrica)?.toLowerCase().includes('integridade'));
        return {
            health: parseInt(deepClean(row?.['Dashboard Visual'] || "0")),
            status: sections.meta.status,
            compliance: sections.meta.compliance
        };
    }, [sections]);

    return { screen, setScreen, sections, global };
};
