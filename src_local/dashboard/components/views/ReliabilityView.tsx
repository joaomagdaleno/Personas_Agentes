import React, { useMemo } from "react";
import { COLORS } from "../../theme.ts";
import { parseTable } from "../../utils.ts";
import { Card } from "../atoms/Card.tsx";
import { Typo } from "../atoms/Typo.tsx";
import { Badge } from "../atoms/Badge.tsx";

export const ReliabilityView = ({ data }: any) => {
    const matrix = useMemo(() => parseTable(data), [data]);
    return (
        <Card title="Matriz de Confiança Atômica" icon="🧪">
            <div style={{ maxHeight: "700px", overflowY: "auto", paddingRight: "10px" }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                        <thead>
                            <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                                {['Componente', 'Entropia', 'Asserções', 'Status'].map(h => (
                                    <th key={h} style={{ textAlign: "left", padding: "16px", borderBottom: `1px solid ${COLORS.border}` }}>
                                        <Typo variant="label">{h}</Typo>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {matrix.map((row: any, i: number) => (
                                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                                    <td style={{ padding: "16px" }}><Typo variant="mono">{row.Componente}</Typo></td>
                                    <td style={{ padding: "16px", fontWeight: 900, color: "white" }}>{row.Entropia || row.Complex}</td>
                                    <td style={{ padding: "16px" }}><Badge status="NEUTRO">{row.Asserções}</Badge></td>
                                    <td style={{ padding: "16px" }}><Badge status={row['Status de Teste']}>{row['Status de Teste']}</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>
    );
};
