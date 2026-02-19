import React from "react";
import { COLORS } from "../../theme.ts";
import { deepClean } from "../../utils.ts";

import { BadgeThemeLogic } from "../../utils/BadgeThemeLogic.ts";

export const Badge = ({ children, status, size = "small" }: any) => {
    const color = BadgeThemeLogic.getColorForStatus(status);

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
