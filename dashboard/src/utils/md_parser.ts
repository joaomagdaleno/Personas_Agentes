export const deepClean = (text: any): string => {
    if (typeof text !== 'string') return String(text || "");
    return text
        .replace(/^[>\s|,\.:;]+/, "")
        .replace(/[`*]/g, "")
        .replace(/[>|]{1,}/g, "")
        .replace(/[,%]/g, "")
        .replace(/:---/g, "")
        .trim();
};

export const parseTable = (content: string) => {
    if (!content) return [];
    const lines = content.split('\n').map(l => l.trim().replace(/^>\s*/, '').trim());
    const tableLines = lines.filter(l => l.startsWith('|') && !l.includes(':---'));
    if (tableLines.length < 2) return [];

    const firstLine = tableLines[0];
    const headers = firstLine.split('|').filter(c => c.trim() !== "").map(c => deepClean(c));
    const rows = tableLines.slice(1).map(line => {
        return line.split('|').filter(c => c.trim() !== "").map(c => deepClean(c));
    });

    return rows.map(row => {
        const obj: any = {};
        headers.forEach((h, i) => {
            if (h) obj[h] = row[i] || "";
        });
        return obj;
    }).filter(row => Object.values(row).some(v => v !== ""));
};

export const extractSection = (md: string, header: string): string => {
    if (!md) return "";
    // More robust regex: matches headers with any level of nesting (#, ##, etc.)
    // and ignores potential icons or emojis at the start of the header name
    const parts = md.split(new RegExp(`^#+\\s+.*${header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'mi'));
    const contentPart = parts[1];
    if (!contentPart) return "";
    const sectionContent = contentPart.split(/\n#+/m)[0];
    return (sectionContent || "").trim();
};
