import React, { useMemo } from "react";
import { COLORS } from "../../theme.ts";
import { parseTable, deepClean } from "../../utils.ts";
import { Card } from "../atoms/Card.tsx";
import { Typo } from "../atoms/Typo.tsx";
import { Badge } from "../atoms/Badge.tsx";

export const AuditView = ({ data, findingsText }: any) => {
    const battle = useMemo(() => parseTable(data), [data]);
    const findings = useMemo(() => {
        if (!findingsText) return [];
        return findingsText.split(/###\s+/).slice(1).map((block: string) => {
            const cleanBlock = block.split('\n').map(l => l.replace(/^>\s*/, '').trim()).join('\n');
            const titleLine = (cleanBlock.split('\n')[0] || "").trim();
            const title = titleLine.replace(/^[-\s>]+/, '').trim();
            const localLine = cleanBlock.match(/\*\*Local:\*\*\s*(.*?)\n/)?.[1] || "Desconhecido";
            const causaMatch = cleanBlock.match(/\*\*Causa:\*\*\s*(.*?)(###|\n\n|$)/s);
            const causa = (causaMatch?.[1] || "—").replace(/^[-\s>]+/, '').trim();

            return {
                title: deepClean(title),
                local: deepClean(localLine),
                causa: deepClean(causa)
            };
        });
    }, [findingsText]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <Card title="Diretrizes de Engenharia (Battle Plan)" icon="🎯">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                    {battle.map((b: any, i: number) => (
                        <div key={i} style={{ padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: `1px solid ${COLORS.border}` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center" }}>
                                <Typo variant="label" style={{ color: "white" }}>{b.Severidade}</Typo>
                                <div style={{ fontSize: "1.2rem", fontWeight: 900 }}>{b['Qtd.'] || b.Qtd || "0"}</div>
                            </div>
                            <Typo variant="body" style={{ fontSize: "0.75rem", marginBottom: "12px" }}>{b['Impacto Estratégico']}</Typo>
                            <Badge status={b['Status de Resposta']}>{b['Status de Resposta']}</Badge>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Audit Finder (Log Detalhado)" icon="🚩">
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "800px", overflowY: "auto", paddingRight: "10px" }}>
                    {findings.map((f: any, i: number) => (
                        <div key={i} style={{ background: "rgba(255,255,255,0.02)", padding: "24px", borderRadius: "16px", border: `1px solid ${COLORS.border}`, position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: f.title.includes('🔴') ? COLORS.danger : (f.title.includes('🟡') ? COLORS.warning : COLORS.accent) }}></div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "20px" }}>
                                <Badge status={f.title} size="large">{f.title}</Badge>
                                <Typo variant="mono" style={{ fontSize: "0.65rem", textAlign: "right", opacity: 0.6 }}>{f.local}</Typo>
                            </div>
                            <Typo variant="body" style={{ color: "rgba(255,255,255,0.8)" }}>{f.causa}</Typo>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};
