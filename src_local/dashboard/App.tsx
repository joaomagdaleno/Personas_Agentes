import React from "react";
// @ts-ignore
import { createRoot } from "react-dom/client";
import { COLORS, FONTS } from "./theme.ts";
import { useDashboard } from "./hooks/useDashboard.ts";
import { Sidebar } from "./components/layout/Sidebar.tsx";
import { ViewArea } from "./components/layout/ViewArea.tsx";

/**
 * 🏛️ SENTINEL SOVEREIGN v8.4 (GOVERNANCE PRECISION)
 * 100% Data coverage + Briefing Hero + Existential Risk context.
 * Fixed Governance View (Table + List separation).
 * Standard: Total UTF-8.
 * Refactor: Atomic Decomposition (< 15 Complexity).
 */

const App = ({ mdContent }: { mdContent: string }) => {
    const { screen, setScreen, sections, global } = useDashboard(mdContent);

    return (
        <div style={{
            display: "flex", height: "100vh", backgroundColor: COLORS.bg, color: COLORS.textPrimary,
            fontFamily: FONTS.ui, overflow: "hidden"
        }}>
            <Sidebar screen={screen} setScreen={setScreen} global={global} />
            <ViewArea screen={screen} sections={sections} global={global} />
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes appSlideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                body { margin: 0; overflow: hidden; background: #06090f; }
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(88, 166, 255, 0.2); border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(88, 166, 255, 0.4); }
                * { box-sizing: border-box; }
            `}} />
        </div>
    );
};

// --- MOUNT ---

const container = document.getElementById("root");
if (container) {
    try {
        // @ts-ignore
        const content = window.__MD_CONTENT__ || "";
        const root = createRoot(container);
        root.render(<App mdContent={content} />);
    } catch (e) {
        console.error("Mount error", e);
    }
}
