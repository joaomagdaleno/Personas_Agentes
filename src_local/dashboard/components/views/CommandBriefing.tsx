import React from "react";
import { COLORS } from "../../theme.ts";
import { deepClean } from "../../utils.ts";
import { Typo } from "../atoms/Typo.tsx";
import { Badge } from "../atoms/Badge.tsx";

export const CommandBriefing = ({ situation, status, env }: any) => (
    <div style={{
        background: "linear-gradient(90deg, rgba(248, 81, 73, 0.05) 0%, transparent 100%)",
        borderLeft: `4px solid ${status.includes('🔴') ? COLORS.danger : COLORS.accent}`,
        padding: "32px", borderRadius: "12px", marginBottom: "48px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        border: `1px solid ${COLORS.border}`
    }}>
        <div>
            <Typo variant="label" style={{ color: COLORS.danger, marginBottom: "8px" }}>Live Situation</Typo>
            <Typo variant="h2" style={{ fontSize: "1.8rem", margin: 0, letterSpacing: "-0.02em" }}>{deepClean(situation)}</Typo>
        </div>
        <div style={{ textAlign: "right" }}>
            <Typo variant="label" style={{ marginBottom: "8px" }}>Environment: {deepClean(env)}</Typo>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "flex-end" }}>
                <div style={{ fontSize: "0.8rem", color: COLORS.textSecondary }}>STATUS:</div>
                <Badge status={status} size="large">{status}</Badge>
            </div>
        </div>
    </div>
);
