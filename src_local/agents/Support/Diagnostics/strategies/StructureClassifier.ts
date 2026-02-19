/**
 * 🏗️ StructureClassifier — specialized in architectural tiering.
 */
export class StructureClassifier {
    /**
     * 🧠 Classifica a natureza estrutural de um arquivo.
     */
    static classify(file: string, info: any): "STRUCTURAL" | "FACADE" | "LOGIC" {
        const compType = info.component_type || "";
        const complexity = info.complexity || 0;

        // Tier 1: STRUCTURAL — Arquivos sem lógica testável
        if (["PACKAGE_MARKER", "CONFIG", "INTERFACE"].includes(compType)) {
            return "STRUCTURAL";
        }

        // Tier 1b: Low complexity files are considered structural
        if (complexity <= 5) {
            return "STRUCTURAL";
        }

        // Tier 2: FACADE — Complexidade baixa, apenas delegação
        if (complexity <= 15) {
            return "FACADE";
        }

        // Tier 3: LOGIC — Tudo o resto precisa de cobertura profunda
        return "LOGIC";
    }
}
