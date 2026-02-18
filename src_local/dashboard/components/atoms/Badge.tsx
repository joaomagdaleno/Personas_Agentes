import React from "react";
import { COLORS } from "../../theme.ts";
import { deepClean } from "../../utils.ts";

export const Badge = ({ children, status, size = "small" }: any) => {
    let color = COLORS.textSecondary;
    const s = String(status || "").toUpperCase();
    if (s.includes('🟢') || s.includes('ESTÁVEL') || s.includes('SYNC-OK') || s.includes('SOVEREIGN') || s.includes('LIVRE') || s.includes('ATIVA') || s.includes('PROFUNDO')) color = COLORS.success;
    else if (s.includes('🔴') || s.includes('CRÍTICO') || s.includes('RISCO') || s.includes('COLAPSO') || s.includes('BLOQUEANTE') || s.includes('FRÁGIL')) color = COLORS.danger;
    else if (s.includes('🟡') || s.includes('ATENÇÃO') || s.includes('PRIORIDADE')) color = COLORS.warning;
    else if (s.includes('🔵') || s.includes('MONITORADO') || s.includes('NEUTRO')) color = COLORS.neutral;

    return (
        <span style={{
            padding: size === "small" ? "3px 8px" : "6px 14px",
            borderRadius: "4px",
            fontSize: size === "small" ? "0.6rem" : "0.75rem",
            fontWeight: 900,
            color,
            backgroundColor: `${color}10`,
            border: `1px solid ${color}20`,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            whiteSpace: "nowrap"
        }}>
            {deepClean(children)}
        </span>
    );
};
