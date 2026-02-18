import React from "react";

export const BAR_THEME = { backgroundColor: "#333", color: "blue" };

export const ProgressBar = ({ value }: { value: number }) => {
    return (
        <div style={{ width: "100%", height: "4px", backgroundColor: BAR_THEME.backgroundColor }}>
            <div style={{ width: `${value}%`, height: "100%", backgroundColor: BAR_THEME.color }} />
        </div>
    );
};
