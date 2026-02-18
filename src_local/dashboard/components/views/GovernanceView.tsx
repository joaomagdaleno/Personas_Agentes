import React, { useMemo } from "react";
import { COLORS } from "../../theme.ts";
import { parseTable, deepClean } from "../../utils.ts";
import { Card } from "../atoms/Card.tsx";
import { Typo } from "../atoms/Typo.tsx";
import { Badge } from "../atoms/Badge.tsx";

export const GovernanceView = ({ data }: any) => {
    // Precise separation of Table and List
    const complianceTable = useMemo(() => parseTable(data.guidelines), [data.guidelines]);
    const guidelines = useMemo(() => {
        return data.guidelines.split('\n')
            .filter((l: string) => l.trim().startsWith('-'))
            .map((l: string) => l.replace(/^[-\s>]+/, '').trim());
    }, [data.guidelines]);

    const roadmap = useMemo(() => data.roadmap.split('\n').filter((l: string) => l.trim().includes('[')).map((l: string) => ({
        done: l.includes('[x]'),
        text: l.replace(/^[-\s>|\[\]x\s]+/, '').trim()
    })), [data.roadmap]);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "24px" }}>
            <div style={{ gridColumn: "span 12" }}>
                <Card title="Matriz de Ativos & Compliance" icon="💎">
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                                    {['Ativo', 'Nível de Compliance', 'Status de Veto'].map(h => (
                                        <th key={h} style={{ textAlign: "left", padding: "16px", borderBottom: `1px solid ${COLORS.border}` }}>
                                            <Typo variant="label">{h}</Typo>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {complianceTable.map((row: any, i: number) => (
                                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                                        <td style={{ padding: "16px" }}><Typo variant="mono">{row.Ativo}</Typo></td>
                                        <td style={{ padding: "16px" }}><Badge status={row['Nível de Compliance']}>{row['Nível de Compliance']}</Badge></td>
                                        <td style={{ padding: "16px" }}><Badge status={row['Status de Veto']}>{row['Status de Veto']}</Badge></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <div style={{ gridColumn: "span 6" }}>
                <Card title="Diretrizes Ativas" icon="⚖️">
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {guidelines.map((g: string, i: number) => (
                            <div key={i} style={{ padding: "16px", background: "rgba(88, 166, 255, 0.05)", borderRadius: "10px", borderLeft: `3px solid ${COLORS.accent}`, color: "white", fontWeight: 700, fontSize: "0.85rem" }}>
                                {deepClean(g)}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            <div style={{ gridColumn: "span 6" }}>
                <Card title="Roadmap para 100%" icon="🗺️">
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {roadmap.map((r: any, i: number) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", opacity: r.done ? 0.5 : 1 }}>
                                <div style={{ width: "20px", height: "20px", borderRadius: "4px", background: r.done ? COLORS.success : "rgba(255,255,255,0.05)", border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "white" }}>
                                    {r.done && "✔"}
                                </div>
                                <Typo variant="body" style={{ color: r.done ? COLORS.success : "white", textDecoration: r.done ? "line-through" : "none" }}>{deepClean(r.text)}</Typo>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
