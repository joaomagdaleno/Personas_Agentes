/**
 * 🛠️ Dashboard Utilities
 * Pure functions for parsing and cleaning Markdown data.
 */

export const deepClean = (text: any): string => {
    if (typeof text !== 'string') return String(text || "");
    // v7.1.2 Atomic Sanitization: Decisively kills ANY formatting artifacts
    return text
        .replace(/^[>\s|,\.:;]+/, "") // Leading
        .replace(/[`*]/g, "")        // Styling
        .replace(/[>|]{1,}/g, "")    // MD Pipes
        .replace(/[,%]/g, "")        // Strips ALL commas and percent signs for numeric extraction
        .replace(/:---/g, "")
        .trim();
};

export const parseTable = (content: string) => {
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

export const extractSection = (md: string, header: string): string => {
    const parts = md.split(new RegExp(header, 'i'));
    const contentPart = parts[1];
    if (!contentPart) return "";
    const sectionContent = contentPart.split(/^## /m)[0];
    return (sectionContent || "").trim();
};
