import React from "react";
import { COLORS } from "../../theme.ts";
import { Typo } from "./Typo.tsx";

export const Card = ({ title, icon, children, style }: any) => (
    <div style={{
        background: COLORS.panel, backdropFilter: "blur(30px)", border: `1px solid ${COLORS.border}`,
        borderRadius: "16px", padding: "28px", height: "100%", ...style
    }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <span style={{ fontSize: "1.1rem" }}>{icon}</span>
            <Typo variant="label">{title}</Typo>
        </div>
        <div style={{ overflowX: "auto", maxWidth: "100%" }}>{children}</div>
    </div>
);
