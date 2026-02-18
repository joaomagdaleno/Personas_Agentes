import React, { useMemo } from "react";
import { COLORS } from "../../theme.ts";
import { parseTable } from "../../utils.ts";
import { Card } from "../atoms/Card.tsx";
import { Typo } from "../atoms/Typo.tsx";
import { ProgressBar } from "../atoms/ProgressBar.tsx";
import { Badge } from "../atoms/Badge.tsx";
import { CommandBriefing } from "./CommandBriefing.tsx";

export const OperationalView = ({ data }: any) => {
    const pillars = useMemo(() => parseTable(data.pillars), [data.pillars]);
    const vitals = useMemo(() => parseTable(data.vitals), [data.vitals]);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "24px" }}>
            <div style={{ gridColumn: "span 12" }}>
                <CommandBriefing
                    situation={data.meta.situation}
                    status={data.meta.status}
                    env={data.meta.env}
                />
            </div>
            <div style={{ gridColumn: "span 8" }}>
                <Card title="Níveis de Integridade" icon="📊">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                        {pillars.map((p: any, i: number) => {
                            const score = parseInt(p.Score) || 0;
                            const max = parseInt(p.Max || p.Máx || "100") || 100;
                            const pct = (score / max) * 100;
                            return (
                                <div key={i} style={{ padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.02)" }}>
                                    <Typo variant="label" style={{ marginBottom: "8px", fontSize: "0.55rem" }}>{p.Pilar}</Typo>
                                    <div style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "12px", color: "white" }}>
                                        {score}<span style={{ opacity: 0.1, fontSize: "0.8rem", marginLeft: "4px" }}>/ {max}</span>
                                    </div>
                                    <ProgressBar value={pct} color={pct < 40 ? COLORS.danger : (pct < 80 ? COLORS.warning : COLORS.success)} />
                                    <div style={{ marginTop: "12px" }}><Badge status={p.Status}>{p.Status}</Badge></div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
            <div style={{ gridColumn: "span 4" }}>
                <Card title="Sinais Vitais" icon="🩺">
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {vitals.map((v: any, i: number) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(255,255,255,0.01)", borderRadius: "8px" }}>
                                <Typo variant="label" style={{ fontSize: "0.55rem" }}>{v.Métrica}</Typo>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontWeight: 800, color: "white", marginBottom: "4px" }}>{v.Valor}</div>
                                    <Badge status={v.Status}>{v.Status}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
