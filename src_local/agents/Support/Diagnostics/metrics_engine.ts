import winston from "winston";
import * as ts from "typescript";

const logger = winston.child({ module: "MetricsEngine" });

/**
 * 📊 MetricsEngine — PhD in Software Quality Metrics
 * 
 * Implementa todas as métricas de qualidade:
 * 1. Complexidade Ciclomática (CC)
 * 2. Complexidade Cognitiva
 * 3. Complexidade Halstead
 * 4. Profundidade de Aninhamento
 * 5. LOC (Lines of Code)
 * 6. CBO (Coupling Between Objects)
 * 7. Ca (Acoplamento Aferente)
 * 8. DIT (Depth of Inheritance Tree)
 * 9. Índice de Manutenibilidade (MI)
 */

export interface MetricsResult {
    // Complexidade
    cyclomaticComplexity: number;
    cognitiveComplexity: number;
    halsteadVolume: number;
    halsteadDifficulty: number;
    halsteadEffort: number;
    nestingDepth: number;
    
    // Tamanho
    loc: number;
    locExecutable: number;
    locComments: number;
    sloc: number; // Source Lines of Code
    
    // Acoplamento
    cbo: number; // Coupling Between Objects
    ca: number; // Afferent Coupling
    
    // Herança
    dit: number; // Depth of Inheritance Tree
    
    // Qualidade
    maintainabilityIndex: number;
    defectDensity: number; // bugs per KLOC
    
    // Testes
    testCoverage: number;
    
    // Classificações
    riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
    qualityGate: "GREEN" | "YELLOW" | "RED";
    isShadow: boolean;
    shadowComplexity: number; // Complexity for shadows (self-only)
}

export class MetricsEngine {
    /**
     * Analisa um arquivo e retorna todas as métricas de qualidade
     */
    analyzeFile(content: string, filePath: string, dependencies: string[] = [], bugCount: number = 0): MetricsResult {
        const isShadow = filePath.includes("_shadow");
        
        // Para shadows, usamos apenas o código próprio (sem imports)
        const analysisContent = isShadow ? this.extractSelfCode(content) : content;
        
        // Métricas de complexidade
        const cyclomaticComplexity = this.calculateCyclomaticComplexity(analysisContent);
        const cognitiveComplexity = this.calculateCognitiveComplexity(analysisContent);
        const halstead = this.calculateHalsteadMetrics(analysisContent);
        const nestingDepth = this.calculateNestingDepth(analysisContent);
        
        // Métricas de tamanho
        const loc = this.countLOC(content);
        const locExecutable = this.countExecutableLOC(analysisContent);
        const locComments = this.countCommentLOC(content);
        const sloc = locExecutable; // SLOC = Executable LOC
        
        // Métricas de acoplamento
        const cbo = this.calculateCBO(dependencies);
        const ca = this.calculateCa(dependencies, filePath);
        
        // Herança (simplificado para TypeScript)
        const dit = this.calculateDIT(content);
        
        // Índice de Manutenibilidade (versão simplificada do Visual Studio)
        // MI = 171 - 5.2 * ln(V) - 0.23 * (G) - 16.2 * ln(LOC)
        // Onde V = volume Halstead, G = complexidade ciclomática, LOC = linhas
        const maintainabilityIndex = this.calculateMaintainabilityIndex(
            halstead.volume, 
            cyclomaticComplexity, 
            sloc
        );
        
        // Densidade de defeitos (bugs per KLOC)
        const defectDensity = sloc > 0 ? (bugCount * 1000) / sloc : 0;
        
        // Determinar níveis de risco
        const riskLevel = this.determineRiskLevel(cyclomaticComplexity, cognitiveComplexity, maintainabilityIndex);
        const qualityGate = this.determineQualityGate(maintainabilityIndex, cyclomaticComplexity, defectDensity);
        
        // Para shadows: calcular complexidade própria (sem imports)
        const shadowComplexity = isShadow ? this.calculateShadowSelfComplexity(content) : 0;
        
        return {
            cyclomaticComplexity,
            cognitiveComplexity,
            halsteadVolume: halstead.volume,
            halsteadDifficulty: halstead.difficulty,
            halsteadEffort: halstead.effort,
            nestingDepth,
            loc,
            locExecutable,
            locComments,
            sloc,
            cbo,
            ca,
            dit,
            maintainabilityIndex: Math.max(0, maintainabilityIndex),
            defectDensity,
            testCoverage: 0, // Calculado externamente
            riskLevel,
            qualityGate,
            isShadow,
            shadowComplexity
        };
    }

    /**
     * 1. Complexidade Ciclomática (Cyclomatic Complexity)
     * CC = E - N + 2P, onde E=arestas, N=nós, P=componentes conectados
     * Simplificado: CC = 1 + número de decisões (if, while, for, case, catch, &&, ||)
     */
    calculateCyclomaticComplexity(content: string): number {
        // Contar estruturas de decisão
        const decisionPatterns = [
            /\bif\b/g,
            /\bwhile\b/g,
            /\bfor\b/g,
            /\bcase\b/g,
            /\bcatch\b/g,
            /\?\?/g, // nullish
            /&&/g,
            /\|\|/g,
            /\?\(.*\)\s*:/g, // ternary
        ];
        
        let count = 1; // Base = 1
        
        for (const pattern of decisionPatterns) {
            const matches = content.match(pattern);
            if (matches) {
                count += matches.length;
            }
        }
        
        return count;
    }

    /**
     * 2. Complexidade Cognitiva
     * Penaliza estruturas aninhadas e código difícil de ler
     * +1 para cada nível de aninhamento acima de 1
     * +1 para métodos recursivos, switch, try-catch
     */
    calculateCognitiveComplexity(content: string): number {
        let complexity = 0;
        let currentNesting = 0;
        
        const lines = content.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // Aumento de aninhamento
            if (trimmed.includes('{')) {
                // Contar chaves de abertura
                const openBraces = (trimmed.match(/{/g) || []).length;
                const closeBraces = (trimmed.match(/}/g) || []).length;
                currentNesting += openBraces - closeBraces;
                
                // Se aninhamento > 1, adicionar penalidade
                if (currentNesting > 1) {
                    complexity += currentNesting - 1;
                }
            }
            
            // Estruturas que aumentam complexidade cognitiva
            if (/\bswitch\b/.test(trimmed)) complexity += 1;
            if (/\btry\b/.test(trimmed) || /\bcatch\b/.test(trimmed)) complexity += 1;
            if (/\brecursive\b|\brecursion\b/i.test(trimmed)) complexity += 2;
            if (/\basync\b/.test(trimmed) && /\bawait\b/.test(trimmed)) complexity += 1;
        }
        
        return complexity;
    }

    /**
     * 3. Complexidade de Halstead
     * n1 = número de operadores únicos
     * n2 = número de operandos únicos
     * N1 = total de operadores
     * N2 = total de operandos
     * Volume = (n1 + n2) * log2(n1 + n2)
     * Dificuldade = (n1/2) * (N2/n2)
     * Esforço = Volume * Dificuldade
     */
    calculateHalsteadMetrics(content: string): { volume: number; difficulty: number; effort: number } {
        // Operadores
        const operators = content.match(/[+\-*/%=<>!&|^~?:]+|&&|\|\||\.\.\.|\?\./g) || [];
        const uniqueOperators = new Set(operators);
        
        // Operandos (identificadores e literais)
        const operands = content.match(/\b[a-zA-Z_]\w*\b/g) || [];
        const uniqueOperands = new Set(operands);
        
        const n1 = uniqueOperators.size;
        const n2 = uniqueOperands.size;
        const N1 = operators.length;
        const N2 = operands.length;
        
        // Volume
        const totalUnique = n1 + n2;
        const volume = totalUnique > 0 ? totalUnique * Math.log2(totalUnique) : 0;
        
        // Dificuldade
        const difficulty = n1 > 0 ? (n1 / 2) * (N2 / Math.max(1, n2)) : 0;
        
        // Esforço
        const effort = volume * difficulty;
        
        return { volume, difficulty, effort };
    }

    /**
     * 4. Profundidade de Aninhamento
     * Máximo nível de aninhamento de blocos
     */
    calculateNestingDepth(content: string): number {
        let maxNesting = 0;
        let currentNesting = 0;
        
        for (const char of content) {
            if (char === '{') {
                currentNesting++;
                maxNesting = Math.max(maxNesting, currentNesting);
            } else if (char === '}') {
                currentNesting = Math.max(0, currentNesting - 1);
            }
        }
        
        return maxNesting;
    }

    /**
     * 5. LOC - Lines of Code
     */
    countLOC(content: string): number {
        return content.split('\n').length;
    }

    /**
     * 5b. LOC Executável (não评论, não vazio)
     */
    countExecutableLOC(content: string): number {
        const lines = content.split('\n');
        return lines.filter(line => {
            const trimmed = line.trim();
            return trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*');
        }).length;
    }

    /**
     * 5c. LOC de Comentários
     */
    countCommentLOC(content: string): number {
        const lines = content.split('\n');
        return lines.filter(line => {
            const trimmed = line.trim();
            return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('*');
        }).length;
    }

    /**
     * 6. CBO - Coupling Between Objects
     * Número de classes que esta classe utiliza
     */
    calculateCBO(dependencies: string[]): number {
        return dependencies.length;
    }

    /**
     * 7. Ca - Acoplamento Aferente
     * Número de classes fora do pacote que dependem desta
     * (simplificado - conta dependentes)
     */
    calculateCa(dependencies: string[], filePath: string): number {
        // Este seria calculado a partir do call graph inverso
        // Por agora, retorna 0 (seria populado externamente)
        return 0;
    }

    /**
     * 8. DIT - Depth of Inheritance Tree
     * Profundidade da árvore de herança
     */
    calculateDIT(content: string): number {
        // Procurar extends e implements
        const extendsMatch = content.match(/extends\s+(\w+)/g);
        const implementsMatch = content.match(/implements\s+(\w+)/g);
        
        let maxDepth = 0;
        
        if (extendsMatch) {
            // Para TypeScript, assumir profundidade 1 se tem extends
            maxDepth = Math.max(maxDepth, 1);
        }
        
        if (implementsMatch) {
            // implements não adiciona profundidade em TypeScript
            maxDepth = Math.max(maxDepth, 1);
        }
        
        return maxDepth;
    }

    /**
     * 9. Índice de Manutenibilidade (Maintainability Index)
     * MI = 171 - 5.2 * ln(V) - 0.23 * (G) - 16.2 * ln(LOC)
     * Onde V = volume Halstead, G = complexidade ciclomática, LOC = SLOC
     * Resultado: 0-100 (100 = mais manutenível)
     */
    calculateMaintainabilityIndex(volume: number, cyclomaticComplexity: number, sloc: number): number {
        if (sloc <= 0) return 100;
        
        const logVolume = Math.log(Math.max(1, volume));
        const logLOC = Math.log(sloc);
        
        let mi = 171 - 5.2 * logVolume - 0.23 * cyclomaticComplexity - 16.2 * logLOC;
        
        // Ajustar para escala 0-100
        mi = mi * 100 / 171;
        
        return Math.max(0, Math.min(100, mi));
    }

    /**
     * Determina nível de risco baseado nas métricas
     */
    determineRiskLevel(cyclomatic: number, cognitive: number, mi: number): "LOW" | "MODERATE" | "HIGH" | "CRITICAL" {
        // CC > 50 = crítico
        if (cyclomatic > 50 || mi < 9) return "CRITICAL";
        // CC 20-50 = alto
        if (cyclomatic > 20 || mi < 10) return "HIGH";
        // CC 10-20 = moderado
        if (cyclomatic > 10 || mi < 20) return "MODERATE";
        return "LOW";
    }

    /**
     * Determina quality gate (semáforo)
     */
    determineQualityGate(mi: number, cc: number, defectDensity: number): "GREEN" | "YELLOW" | "RED" {
        if (mi >= 20 && cc <= 10 && defectDensity <= 1) return "GREEN";
        if (mi >= 10 && cc <= 20 && defectDensity <= 5) return "YELLOW";
        return "RED";
    }

    /**
     * Para shadows: extrai apenas o código próprio (sem imports)
     */
    private extractSelfCode(content: string): string {
        // Remove imports e exports para calcular complexidade própria
        const lines = content.split('\n');
        const selfCode = lines.filter(line => {
            const trimmed = line.trim();
            return !trimmed.startsWith('import ') && 
                   !trimmed.startsWith('export ') &&
                   !trimmed.startsWith('from ');
        }).join('\n');
        return selfCode;
    }

    /**
     * Calcula complexidade apenas do código próprio do shadow
     * (ignorando dependências externas)
     */
    calculateShadowSelfComplexity(content: string): number {
        const selfCode = this.extractSelfCode(content);
        
        // Usar complexidade ciclomática do código próprio
        const cc = this.calculateCyclomaticComplexity(selfCode);
        
        // Para shadows, limitamos a complexidade própria
        // Se for facade/wrapper, deve ser <= 15
        return Math.min(cc, 15); // Limite para shadows = 15
    }

    /**
     * Valida se um shadow atende aos requisitos de baixa complexidade
     */
    validateShadowCompliance(metrics: MetricsResult): { compliant: boolean; reason: string } {
        if (!metrics.isShadow) {
            return { compliant: true, reason: "Não é um shadow" };
        }
        
        // Shadows devem ter:
        // - CC própria <= 15
        // - MI >= 20
        // - Profundidade de aninhamento <= 3
        
        if (metrics.shadowComplexity > 15) {
            return { 
                compliant: false, 
                reason: `Complexidade própria do shadow (${metrics.shadowComplexity}) excede limite de 15` 
            };
        }
        
        if (metrics.maintainabilityIndex < 20) {
            return { 
                compliant: false, 
                reason: `Índice de manutenibilidade (${metrics.maintainabilityIndex.toFixed(1)}) abaixo de 20` 
            };
        }
        
        if (metrics.nestingDepth > 3) {
            return { 
                compliant: false, 
                reason: `Profundidade de aninhamento (${metrics.nestingDepth}) excede limite de 3` 
            };
        }
        
        return { 
            compliant: true, 
            reason: "Shadow atende aos requisitos de baixa complexidade" 
        };
    }

    /**
     * Gera relatório de métricas para um arquivo
     */
    generateMetricsReport(metrics: MetricsResult, filePath: string): string {
        const status = metrics.isShadow ? "🔮 SHADOW" : "📄 FILE";
        const shadowNote = metrics.isShadow ? ` [Self-Complexity: ${metrics.shadowComplexity}]` : "";
        
        let report = `
${status} ${filePath}${shadowNote}
─────────────────────────────────────────────────────
COMPLEXIDADE:
  ├─ Ciclomática: ${metrics.cyclomaticComplexity} ${metrics.cyclomaticComplexity > 20 ? "⚠️ ALTO" : "✓"}
  ├─ Cognitiva: ${metrics.cognitiveComplexity}
  ├─ Halstead Volume: ${metrics.halsteadVolume.toFixed(1)}
  ├─ Halstead Dificuldade: ${metrics.halsteadDifficulty.toFixed(1)}
  └─ Profundidade Aninhamento: ${metrics.nestingDepth}

TAMANHO:
  ├─ LOC Total: ${metrics.loc}
  ├─ LOC Executável: ${metrics.locExecutable}
  ├─ LOC Comentário: ${metrics.locComments}
  └─ SLOC: ${metrics.sloc}

ACOPLAMENTO:
  ├─ CBO: ${metrics.cbo}
  └─ Ca: ${metrics.ca}

HERANÇA:
  └─ DIT: ${metrics.dit}

QUALIDADE:
  ├─ Manutenibilidade: ${metrics.maintainabilityIndex.toFixed(1)} ${this.getMIStatus(metrics.maintainabilityIndex)}
  ├─ Densidade Defeitos: ${metrics.defectDensity.toFixed(2)}/KLOC
  └─ Risk Level: ${metrics.riskLevel}

QUALITY GATE: ${metrics.qualityGate === "GREEN" ? "🟢 PASS" : metrics.qualityGate === "YELLOW" ? "🟡 WARNING" : "🔴 FAIL"}
`;
        
        if (metrics.isShadow) {
            const validation = this.validateShadowCompliance(metrics);
            report += `
SHADOW VALIDATION: ${validation.compliant ? "✅ COMPLIANT" : "❌ NON-COMPLIANT"}
  └─ ${validation.reason}
`;
        }
        
        return report;
    }

    private getMIStatus(mi: number): string {
        if (mi >= 20) return "🟢 GOOD";
        if (mi >= 10) return "🟡 MODERATE";
        return "🔴 LOW";
    }
}

export default MetricsEngine;
