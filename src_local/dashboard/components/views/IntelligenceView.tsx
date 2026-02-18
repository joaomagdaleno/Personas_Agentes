import React, { useMemo } from "react";
import { COLORS } from "../../theme.ts";
import { parseTable, deepClean } from "../../utils.ts";
import { Card } from "../atoms/Card.tsx";
import { Typo } from "../atoms/Typo.tsx";
import { Badge } from "../atoms/Badge.tsx";
import { ProgressBar } from "../atoms/ProgressBar.tsx";

export const IntelligenceView = ({ data }: any) => {
    const bridge = useMemo(() => parseTable(data.bridge), [data.bridge]);
    const entropy = useMemo(() => parseTable(data.entropy), [data.entropy]);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "24px" }}>
            <div style={{ gridColumn: "span 5" }}>
                <Card title="Neural Bridge Sync" icon="🛰️">
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {bridge.map((b: any, i: number) => (
                            <div key={i} style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <Typo variant="label" style={{ fontSize: "0.5rem", marginBottom: "4px" }}>{b.Segmento}</Typo>
                                    <Typo variant="mono">{b.Identificador}</Typo>
                                </div>
                                <Badge status={b['Bridge Status']}>{b['Bridge Status']}</Badge>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            <div style={{ gridColumn: "span 7" }}>
                <Card title="Mapa de Entropia" icon="🌪️">
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "600px", overflowY: "auto", paddingRight: "10px" }}>
                        {entropy.map((e: any, i: number) => {
                            const complexValue = e['Complex.'] || e.Complex || e.Complexity || "0";
                            // Deep extraction: remove everything non-numeric
                            const complex = parseInt(deepClean(complexValue).replace(/[^0-9]/g, "")) || 0;
                            // Normalize complexity for visual bar (Scale: 0-200+)
                            const visualScore = Math.min(100, Math.round((complex / 250) * 100));
                            return (
                                <div key={i} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.01)", borderRadius: "8px", border: `1px solid ${COLORS.border}` }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                        <Typo variant="mono">{e.Componente}</Typo>
                                        <Badge status={complex > 100 ? "CRÍTICO" : "MONITORADO"}>Complex: {complex}%</Badge>
                                    </div>
                                    <ProgressBar value={visualScore} color={complex > 150 ? COLORS.danger : (complex > 80 ? COLORS.warning : COLORS.success)} height="3px" />
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
};
