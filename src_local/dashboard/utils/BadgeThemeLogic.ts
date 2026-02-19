import { COLORS } from "../theme.ts";

/**
 * 🎨 BadgeThemeLogic — specialized in status-to-color mapping.
 */
export class BadgeThemeLogic {
    static getColorForStatus(status: string): string {
        const s = String(status || "").toUpperCase();
        const map = [
            { terms: ['🟢', 'ESTÁVEL', 'SYNC-OK', 'SOVEREIGN', 'LIVRE', 'ATIVA', 'PROFUNDO'], color: COLORS.success },
            { terms: ['🔴', 'CRÍTICO', 'RISCO', 'COLAPSO', 'BLOQUEANTE', 'FRÁGIL'], color: COLORS.danger },
            { terms: ['🟡', 'ATENÇÃO', 'PRIORIDADE'], color: COLORS.warning },
            { terms: ['🔵', 'MONITORADO', 'NEUTRO'], color: COLORS.neutral }
        ];

        const match = map.find(m => m.terms.some(t => s.includes(t)));
        return match ? match.color : COLORS.textSecondary;
    }
}
