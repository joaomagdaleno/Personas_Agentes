import React from "react";
import { COLORS, FONTS } from "../../theme.ts";

export const Typo = ({ variant, children, style }: any) => {
    const variants: any = {
        h1: { fontSize: "3rem", fontWeight: 900, letterSpacing: "-0.04em", color: COLORS.textPrimary, fontFamily: FONTS.display },
        h2: { fontSize: "1.2rem", fontWeight: 800, letterSpacing: "0.05em", color: COLORS.textPrimary, textTransform: "uppercase", marginBottom: "16px" },
        label: { fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.15em", color: COLORS.textSecondary, textTransform: "uppercase" },
        body: { fontSize: "0.9rem", color: COLORS.textSecondary, lineHeight: 1.6 },
        mono: { fontFamily: FONTS.mono, fontSize: "0.75rem", color: COLORS.accent, wordBreak: "break-all" }
    };
    return <div style={{ ...variants[variant], ...style }}>{children}</div>;
};
