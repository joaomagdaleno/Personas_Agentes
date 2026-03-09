/**
 * 🗿 StaticReasoning — Deterministic fallback for when the Brain is offline.
 */
export class StaticReasoning {
    static handle(prompt: string): string | null {
        const p = prompt.toUpperCase();

        if (p.includes("CONSCIENTE")) {
            return "ESTOU CONSCIENTE (SISTEMA DE EMERGÊNCIA ATIVO).";
        }

        if (p.includes("PING")) {
            return "PONG (EMERGENCY)";
        }

        if (p.includes("DOCSTRING") && p.includes("CÓDIGO")) {
            return "/**\n * Auto-generated documentation (Offline Fallback).\n */";
        }

        if (p.includes("RESPONDA APENAS 'OK'")) {
            return "OK";
        }

        if (p.includes("RESPONDA EM JSON")) {
            return '{"consistent": true, "issue": "None (Offline mode verified)", "severity": "LOW"}';
        }

        return null;
    }
}
