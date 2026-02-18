import React from "react";
import { COLORS } from "../../theme.ts";

export const ProgressBar = ({ value, color = COLORS.accent, height = "4px" }: any) => (
    <div style={{ width: "100%", height, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
            width: `${Math.min(Math.max(value, 0), 100)}%`,
            height: "100%",
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}33`,
            transition: "width 2s cubic-bezier(0.19, 1, 0.22, 1)"
        }}></div>
    </div>
);
