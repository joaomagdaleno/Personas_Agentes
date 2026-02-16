import React, { useState, useMemo, useEffect } from "react";
// @ts-ignore
import { createRoot } from "react-dom/client";

/**
 * 🏛️ SENTINEL SOVEREIGN v6.9 (GOVERNANCE PRECISION)
 * 100% Data coverage + Briefing Hero + Existential Risk context.
 * Fixed Governance View (Table + List separation).
 * Standard: Total UTF-8.
 */

// --- DESIGN TOKENS ---

const COLORS = {
    bg: "#06090f",
    panel: "rgba(13, 17, 23, 0.7)",
    border: "rgba(255, 255, 255, 0.08)",
    textPrimary: "#ffffff",
    textSecondary: "#7d8590",
    accent: "#58a6ff",
    success: "#3fb950",
    danger: "#f85149",
    warning: "#d29922",
    neutral: "#58a6ff"
};

const FONTS = {
    display: '"Inter", "Outfit", sans-serif',
    ui: '"Inter", system-ui, sans-serif',
    mono: '"JetBrains Mono", monospace'
};

// --- ENGINES & UTILS ---

const deepClean = (text: any): string => {
    if (typeof text !== 'string') return String(text || "");
    // v7.0 High-Intensity Sanitization: Decisively strips all leading artifacts including commas and dots
    return text
        .replace(/^[>\s|,\.:;]+/, "")
        .replace(/[>|]{1,}/g, "")
        .replace(/[`*]/g, "")
        .replace(/:---/g, "")
        .trim();
};

const parseTable = (content: string) => {
    if (!content) return [];
    const lines = content.split('\n').map(l => l.trim().replace(/^>\s*/, '').trim());
    const tableLines = lines.filter(l => l.startsWith('|') && !l.includes(':---'));
    const firstLine = tableLines[0];
    if (!firstLine) return [];

    const headers = firstLine.split('|').filter(c => c.trim() !== "").map(c => deepClean(c));
    const rows = tableLines.slice(1).map(line => {
        return line.split('|').filter(c => c.trim() !== "").map(c => deepClean(c));
    });

    return rows.map(row => {
        const obj: any = {};
        headers.forEach((h, i) => obj[h] = row[i] || "");
        return obj;
    });
};

const extractSection = (md: string, header: string): string => {
    const parts = md.split(new RegExp(header, 'i'));
    const contentPart = parts[1];
    if (!contentPart) return "";
    const sectionContent = contentPart.split(/^## /m)[0];
    return (sectionContent || "").trim();
};

// --- ATOMIC COMPONENTS ---

const Typo = ({ variant, children, style }: any) => {
    const variants: any = {
        h1: { fontSize: "3rem", fontWeight: 900, letterSpacing: "-0.04em", color: COLORS.textPrimary, fontFamily: FONTS.display },
        h2: { fontSize: "1.2rem", fontWeight: 800, letterSpacing: "0.05em", color: COLORS.textPrimary, textTransform: "uppercase", marginBottom: "16px" },
        label: { fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.15em", color: COLORS.textSecondary, textTransform: "uppercase" },
        body: { fontSize: "0.9rem", color: COLORS.textSecondary, lineHeight: 1.6 },
        mono: { fontFamily: FONTS.mono, fontSize: "0.75rem", color: COLORS.accent, wordBreak: "break-all" }
    };
    return <div style={{ ...variants[variant], ...style }}>{children}</div>;
};

const Badge = ({ children, status, size = "small" }: any) => {
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

const ProgressBar = ({ value, color = COLORS.accent, height = "4px" }: any) => (
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

const Card = ({ title, icon, children, style }: any) => (
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

// --- VIEW COMPONENTS ---

const CommandBriefing = ({ situation, status, env }: any) => (
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

const OperationalView = ({ data }: any) => {
    const pillars = useMemo(() => parseTable(data.pillars), [data.pillars]);
    const vitals = useMemo(() => parseTable(data.vitals), [data.vitals]);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "24px" }}>
            <div style={{ gridColumn: "span 12" }}>
                <CommandBriefing
                    situation={data.meta.situation}
                    status={data.meta.status}
                    env={data.meta.env}
                />
            </div>
            <div style={{ gridColumn: "span 8" }}>
                <Card title="Níveis de Integridade" icon="📊">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                        {pillars.map((p: any, i: number) => {
                            const score = parseInt(p.Score) || 0;
                            const max = parseInt(p.Max || p.Máx || "100") || 100;
                            const pct = (score / max) * 100;
                            return (
                                <div key={i} style={{ padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.02)" }}>
                                    <Typo variant="label" style={{ marginBottom: "8px", fontSize: "0.55rem" }}>{p.Pilar}</Typo>
                                    <div style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "12px", color: "white" }}>
                                        {score}<span style={{ opacity: 0.1, fontSize: "0.8rem", marginLeft: "4px" }}>/ {max}</span>
                                    </div>
                                    <ProgressBar value={pct} color={pct < 40 ? COLORS.danger : (pct < 80 ? COLORS.warning : COLORS.success)} />
                                    <div style={{ marginTop: "12px" }}><Badge status={p.Status}>{p.Status}</Badge></div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
            <div style={{ gridColumn: "span 4" }}>
                <Card title="Sinais Vitais" icon="🩺">
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {vitals.map((v: any, i: number) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(255,255,255,0.01)", borderRadius: "8px" }}>
                                <Typo variant="label" style={{ fontSize: "0.55rem" }}>{v.Métrica}</Typo>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontWeight: 800, color: "white", marginBottom: "4px" }}>{v.Valor}</div>
                                    <Badge status={v.Status}>{v.Status}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

const GovernanceView = ({ data }: any) => {
    // Precise separation of Table and List
    const complianceTable = useMemo(() => parseTable(data.guidelines), [data.guidelines]);
    const guidelines = useMemo(() => {
        return data.guidelines.split('\n')
            .filter((l: string) => l.trim().startsWith('-'))
            .map((l: string) => l.replace(/^[-\s>]+/, '').trim());
    }, [data.guidelines]);

    const roadmap = useMemo(() => data.roadmap.split('\n').filter((l: string) => l.trim().includes('[')).map((l: string) => ({
        done: l.includes('[x]'),
        text: l.replace(/^[-\s>|\[\]x\s]+/, '').trim()
    })), [data.roadmap]);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "24px" }}>
            <div style={{ gridColumn: "span 12" }}>
                <Card title="Matriz de Ativos & Compliance" icon="💎">
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                                    {['Ativo', 'Nível de Compliance', 'Status de Veto'].map(h => (
                                        <th key={h} style={{ textAlign: "left", padding: "16px", borderBottom: `1px solid ${COLORS.border}` }}>
                                            <Typo variant="label">{h}</Typo>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {complianceTable.map((row: any, i: number) => (
                                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                                        <td style={{ padding: "16px" }}><Typo variant="mono">{row.Ativo}</Typo></td>
                                        <td style={{ padding: "16px" }}><Badge status={row['Nível de Compliance']}>{row['Nível de Compliance']}</Badge></td>
                                        <td style={{ padding: "16px" }}><Badge status={row['Status de Veto']}>{row['Status de Veto']}</Badge></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <div style={{ gridColumn: "span 6" }}>
                <Card title="Diretrizes Ativas" icon="⚖️">
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {guidelines.map((g: string, i: number) => (
                            <div key={i} style={{ padding: "16px", background: "rgba(88, 166, 255, 0.05)", borderRadius: "10px", borderLeft: `3px solid ${COLORS.accent}`, color: "white", fontWeight: 700, fontSize: "0.85rem" }}>
                                {deepClean(g)}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            <div style={{ gridColumn: "span 6" }}>
                <Card title="Roadmap para 100%" icon="🗺️">
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {roadmap.map((r: any, i: number) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", opacity: r.done ? 0.5 : 1 }}>
                                <div style={{ width: "20px", height: "20px", borderRadius: "4px", background: r.done ? COLORS.success : "rgba(255,255,255,0.05)", border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "white" }}>
                                    {r.done && "✔"}
                                </div>
                                <Typo variant="body" style={{ color: r.done ? COLORS.success : "white", textDecoration: r.done ? "line-through" : "none" }}>{deepClean(r.text)}</Typo>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

const IntelligenceView = ({ data }: any) => {
    const bridge = useMemo(() => parseTable(data.bridge), [data.bridge]);
    const entropy = useMemo(() => parseTable(data.entropy), [data.entropy]);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "24px" }}>
            <div style={{ gridColumn: "span 5" }}>
                <Card title="Neural Bridge Sync" icon="🛰️">
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {bridge.map((b: any, i: number) => (
                            <div key={i} style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <Typo variant="label" style={{ fontSize: "0.5rem", marginBottom: "4px" }}>{b.Segmento}</Typo>
                                    <Typo variant="mono">{b.Identificador}</Typo>
                                </div>
                                <Badge status={b['Bridge Status']}>{b['Bridge Status']}</Badge>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            <div style={{ gridColumn: "span 7" }}>
                <Card title="Mapa de Entropia" icon="🌪️">
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {entropy.map((e: any, i: number) => {
                            const complexValue = e['Complex.'] || e.Complex || e.Complexity || "0";
                            const complex = parseInt(String(complexValue).replace(/[`*]/g, '')) || 0;
                            const probValue = e['Instabilidade (Prob.)'] || "0";
                            const prob = deepClean(probValue);
                            return (
                                <div key={i} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.01)", borderRadius: "8px", border: `1px solid ${COLORS.border}` }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                        <Typo variant="mono">{e.Componente}</Typo>
                                        <Badge status={parseInt(prob) > 70 ? "CRÍTICO" : "MONITORADO"}>Prob: {prob}</Badge>
                                    </div>
                                    <ProgressBar value={complex * 1.5} color={complex > 40 ? COLORS.danger : COLORS.success} height="3px" />
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
};

const ReliabilityView = ({ data }: any) => {
    const matrix = useMemo(() => parseTable(data), [data]);
    return (
        <Card title="Matriz de Confiança Atômica" icon="🧪">
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                    <thead>
                        <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                            {['Componente', 'Entropia', 'Asserções', 'Status'].map(h => (
                                <th key={h} style={{ textAlign: "left", padding: "16px", borderBottom: `1px solid ${COLORS.border}` }}>
                                    <Typo variant="label">{h}</Typo>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {matrix.map((row: any, i: number) => (
                            <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                                <td style={{ padding: "16px" }}><Typo variant="mono">{row.Componente}</Typo></td>
                                <td style={{ padding: "16px", fontWeight: 900, color: "white" }}>{row.Entropia || row.Complex}</td>
                                <td style={{ padding: "16px" }}><Badge status="NEUTRO">{row.Asserções}</Badge></td>
                                <td style={{ padding: "16px" }}><Badge status={row['Status de Teste']}>{row['Status de Teste']}</Badge></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const AuditView = ({ data, findingsText }: any) => {
    const battle = useMemo(() => parseTable(data), [data]);
    const findings = useMemo(() => {
        if (!findingsText) return [];
        return findingsText.split(/###\s+/).slice(1).map((block: string) => {
            const cleanBlock = block.split('\n').map(l => l.replace(/^>\s*/, '').trim()).join('\n');
            const titleLine = (cleanBlock.split('\n')[0] || "").trim();
            const title = titleLine.replace(/^[-\s>]+/, '').trim();
            const localLine = cleanBlock.match(/\*\*Local:\*\*\s*(.*?)\n/)?.[1] || "Desconhecido";
            const causaMatch = cleanBlock.match(/\*\*Causa:\*\*\s*(.*?)(###|\n\n|$)/s);
            const causa = (causaMatch?.[1] || "—").replace(/^[-\s>]+/, '').trim();

            return {
                title: deepClean(title),
                local: deepClean(localLine),
                causa: deepClean(causa)
            };
        });
    }, [findingsText]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <Card title="Diretrizes de Engenharia (Battle Plan)" icon="🎯">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                    {battle.map((b: any, i: number) => (
                        <div key={i} style={{ padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: `1px solid ${COLORS.border}` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center" }}>
                                <Typo variant="label" style={{ color: "white" }}>{b.Severidade}</Typo>
                                <div style={{ fontSize: "1.2rem", fontWeight: 900 }}>{b['Qtd.'] || b.Qtd || "0"}</div>
                            </div>
                            <Typo variant="body" style={{ fontSize: "0.75rem", marginBottom: "12px" }}>{b['Impacto Estratégico']}</Typo>
                            <Badge status={b['Status de Resposta']}>{b['Status de Resposta']}</Badge>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Audit Finder (Log Detalhado)" icon="🚩">
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {findings.map((f: any, i: number) => (
                        <div key={i} style={{ background: "rgba(255,255,255,0.02)", padding: "24px", borderRadius: "16px", border: `1px solid ${COLORS.border}`, position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: f.title.includes('🔴') ? COLORS.danger : (f.title.includes('🟡') ? COLORS.warning : COLORS.accent) }}></div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "20px" }}>
                                <Badge status={f.title} size="large">{f.title}</Badge>
                                <Typo variant="mono" style={{ fontSize: "0.65rem", textAlign: "right", opacity: 0.6 }}>{f.local}</Typo>
                            </div>
                            <Typo variant="body" style={{ color: "rgba(255,255,255,0.8)" }}>{f.causa}</Typo>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

// --- MAIN APP ---

const App = ({ mdContent }: { mdContent: string }) => {
    const [screen, setScreen] = useState('ops');

    const sections = useMemo(() => {
        return {
            sync: extractSection(mdContent, '## 🧬 SINCRONIA DE IDENTIDADE'),
            pillars: extractSection(mdContent, '### 📊 DECOMPOSIÇÃO DA SAÚDE \\(PILARES\\)'),
            vitals: extractSection(mdContent, '## 🩺 SINAIS VITAIS DO PRODUTO'),
            guidelines: extractSection(mdContent, '### ⚖️ DIRETRIZES DE GOVERNANÇA PHD'),
            roadmap: extractSection(mdContent, '### 🗺️ ROADMAP PARA 100%'),
            bridge: extractSection(mdContent, '## 🗺️ TOPOLOGIA DE SINCRONIA \\(NEURAL BRIDGE\\)'),
            entropy: extractSection(mdContent, '## 🌪️ MAPA DE ENTROPIA & ACOPLAMENTO'),
            matrix: extractSection(mdContent, '## 🧪 MATRIZ DE CONFIANÇA'),
            battle: extractSection(mdContent, '## 🎯 PLANO DE BATALHA: DIRETRIZES DE ENGENHARIA'),
            findings: mdContent.split('## 🚩 ACHADOS DETALHADOS')[1] || "",
            meta: {
                status: deepClean(mdContent.match(/\*\*Status Operacional:\*\*\s*(.*?)\n/)?.[1] || "OFFLINE"),
                compliance: deepClean(mdContent.match(/💎\s*(.*?)\s*\|/)?.[1] || "SOVEREIGN"),
                env: deepClean(mdContent.match(/\*\*Ambiente:\*\*\s*(.*?)\n/)?.[1] || "LOCAL"),
                situation: deepClean(mdContent.match(/💀\s*`(.*?)`/)?.[1] || "OPERACIONAL"),
                existentialRisk: deepClean(extractSection(mdContent, '## 💀 Risco Existencial'))
            }
        };
    }, [mdContent]);

    const global = useMemo(() => {
        const table = parseTable(sections.sync);
        const row = table.find(r => deepClean(r.Métrica)?.toLowerCase().includes('integridade'));
        return {
            health: parseInt(deepClean(row?.['Dashboard Visual'] || "0")),
            status: sections.meta.status,
            compliance: sections.meta.compliance
        };
    }, [sections]);

    return (
        <div style={{
            display: "flex", height: "100vh", backgroundColor: COLORS.bg, color: COLORS.textPrimary,
            fontFamily: FONTS.ui, overflow: "hidden"
        }}>

            <aside style={{
                width: "300px", background: "#0d1117", borderRight: `1px solid ${COLORS.border}`,
                padding: "50px 30px", display: "flex", flexDirection: "column", gap: "40px",
                flexShrink: 0
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 10px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: COLORS.accent, boxShadow: `0 0 10px ${COLORS.accent}` }}></div>
                    <Typo variant="label" style={{ color: "white", fontSize: "0.85rem", letterSpacing: "0.05em" }}>Sovereign v7.0</Typo>
                </div>

                <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {[
                        { id: 'ops', label: 'Operacional', icon: '📊' },
                        { id: 'gov', label: 'Governança', icon: '⚖️' },
                        { id: 'intel', label: 'Inteligência', icon: '🧠' },
                        { id: 'trust', label: 'Confiabilidade', icon: '🧪' },
                        { id: 'audit', label: 'Auditoria', icon: '🚩' }
                    ].map(item => (
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

            <main style={{
                flex: 1, padding: "60px 80px", overflowY: "auto",
                background: "radial-gradient(ellipse at top right, #0d1117 0%, #06090f 80%)",
                display: "flex", flexDirection: "column"
            }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", flex: 1 }}>

                    <header style={{ marginBottom: "64px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div>
                            <Typo variant="label" style={{ color: COLORS.accent, marginBottom: "8px" }}>Protocol Level :: Sovereign</Typo>
                            <Typo variant="h1" style={{ fontSize: "2.8rem" }}>
                                {screen === 'ops' ? 'Operational Health' :
                                    screen === 'gov' ? 'Governance Strategy' :
                                        screen === 'intel' ? 'Intelligence Hub' :
                                            screen === 'trust' ? 'Reliability Matrix' : 'Compliance Audit'}
                            </Typo>
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

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes appSlideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                body { margin: 0; overflow: hidden; background: #06090f; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
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
