import React from "react";
import { COLORS } from "../../theme.ts";
import { Typo } from "../atoms/Typo.tsx";
import { Badge } from "../atoms/Badge.tsx";
import { ProgressBar } from "../atoms/ProgressBar.tsx";

export const Sidebar = ({ screen, setScreen, global }: any) => {
    const data = [
        { id: 'ops', label: 'Operacional', icon: '📊' },
        { id: 'gov', label: 'Governança', icon: '⚖️' },
        { id: 'intel', label: 'Inteligência', icon: '🧠' },
        { id: 'trust', label: 'Confiabilidade', icon: '🧪' },
        { id: 'audit', label: 'Auditoria', icon: '🚩' }
    ];

    return (
        <aside style={{
            width: "300px", background: "#0d1117", borderRight: `1px solid ${COLORS.border}`,
            padding: "50px 30px", display: "flex", flexDirection: "column", gap: "40px",
            flexShrink: 0
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 10px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: COLORS.accent, boxShadow: `0 0 10px ${COLORS.accent}` }}></div>
                <Typo variant="label" style={{ color: "white", fontSize: "0.85rem", letterSpacing: "0.05em" }}>Sovereign v7.1</Typo>
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {data.map(item => (
                    <div
                        key={item.id}
                        onClick={() => setScreen(item.id)}
                        style={{
                            padding: "14px 18px", borderRadius: "10px", cursor: "pointer",
                            background: screen === item.id ? "rgba(255,255,255,0.06)" : "transparent",
                            color: screen === item.id ? "white" : COLORS.textSecondary,
                            fontWeight: 700, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "14px",
                            transition: "all 0.2s ease",
                            border: `1px solid ${screen === item.id ? COLORS.border : "transparent"}`
                        }}
                    >
                        <span style={{ filter: screen === item.id ? "none" : "grayscale(1)" }}>{item.icon}</span> {item.label}
                    </div>
                ))}
            </nav>

            <div style={{ flex: 1 }}></div>

            <div style={{ padding: "24px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: `1px solid ${COLORS.border}` }}>
                <Typo variant="label" style={{ marginBottom: "10px", fontSize: "0.5rem" }}>Core Integrity</Typo>
                <div style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "10px", color: "white" }}>{global.health}%</div>
                <ProgressBar value={global.health} color={global.health > 80 ? COLORS.success : (global.health > 40 ? COLORS.warning : COLORS.danger)} />
                <div style={{ marginTop: "16px" }}><Badge status={global.status}>{global.status}</Badge></div>
            </div>
        </aside>
    );
};
