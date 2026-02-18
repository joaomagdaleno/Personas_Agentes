import React from "react";
import { COLORS } from "../../theme.ts";
import { Typo } from "../atoms/Typo.tsx";
import { Badge } from "../atoms/Badge.tsx";
import { OperationalView } from "../views/OperationalView.tsx";
import { GovernanceView } from "../views/GovernanceView.tsx";
import { IntelligenceView } from "../views/IntelligenceView.tsx";
import { ReliabilityView } from "../views/ReliabilityView.tsx";
import { AuditView } from "../views/AuditView.tsx";

export const ViewArea = ({ screen, sections, global }: any) => {
    const title = screen === 'ops' ? 'Operational Health' :
        screen === 'gov' ? 'Governance Strategy' :
            screen === 'intel' ? 'Intelligence Hub' :
                screen === 'trust' ? 'Reliability Matrix' : 'Compliance Audit';

    return (
        <main style={{
            flex: 1, padding: "60px 80px", overflowY: "auto",
            background: "radial-gradient(ellipse at top right, #0d1117 0%, #06090f 80%)",
            display: "flex", flexDirection: "column"
        }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", flex: 1 }}>

                <header style={{ marginBottom: "64px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                        <Typo variant="label" style={{ color: COLORS.accent, marginBottom: "8px" }}>Protocol Level :: Sovereign</Typo>
                        <Typo variant="h1" style={{ fontSize: "2.8rem" }}>{title}</Typo>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <Typo variant="label" style={{ marginBottom: "8px" }}>Compliance</Typo>
                        <Badge status="SOVEREIGN" size="large">{global.compliance}</Badge>
                    </div>
                </header>

                <div key={screen} style={{ animation: "appSlideUp 0.5s cubic-bezier(0.19, 1, 0.22, 1)" }}>
                    {screen === 'ops' && <OperationalView data={sections} />}
                    {screen === 'gov' && <GovernanceView data={sections} />}
                    {screen === 'intel' && <IntelligenceView data={sections} />}
                    {screen === 'trust' && <ReliabilityView data={sections.matrix} />}
                    {screen === 'audit' && <AuditView data={sections.battle} findingsText={sections.findings} />}
                </div>

            </div>

            <footer style={{
                marginTop: "80px", padding: "40px", borderTop: `1px solid ${COLORS.border}`,
                background: "rgba(0,0,0,0.2)", borderRadius: "20px 20px 0 0"
            }}>
                <Typo variant="label" style={{ color: COLORS.danger, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.2rem" }}>💀</span> RISCO EXISTENCIAL
                </Typo>
                <Typo variant="mono" style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
                    {sections.meta.existentialRisk || "GOVERNANÇA ATIVA. NENHUM RISCO IMINENTE DETECTADO FORA DOS PARÂMETROS."}
                </Typo>
            </footer>
        </main>
    );
};
