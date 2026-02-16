import * as ts from "typescript";
import winston from "winston";
import { ASTIntelligence } from "../../../utils/ast_intelligence.ts";
import {
    SAFE_METADATA_VARS,
    SAFE_LOG_METHODS,
    CORE_PERFORMANCE_FUNCS,
    ANALYZER_CLASSES,
    ANALYZER_METHODS
} from "./safety_definitions.ts";

const logger = winston.child({ module: "SafetySupremeJudge" });

/**
 * ⚖️ Juiz Supremo de Segurança (High-Fidelity TypeScript Version).
 * Consolida 5 módulos legacy de heurísticas e julgamento de contexto.
 * 
 * Melhorias sobre a versão legacy:
 * 1. Integração profunda com ASTIntelligence (TypeScript Compiler API).
 * 2. Análise de "Intencionalidade": Distingue strings em relatórios de código executável.
 * 3. Detecção de atribuição segura (Metadata assignments).
 * 4. Verificação de handlers de exceção com telemetria obrigatória.
 */
export class SafetySupremeJudge {
    private ast: ASTIntelligence;

    constructor() {
        this.ast = new ASTIntelligence();
    }

    /**
     * Julga se um nó da AST está em um contexto seguro.
     */
    public isNodeSafe(node: ts.Node, sourceFile: ts.SourceFile, ignoreTest = false): boolean {
        // 1. Contexto de Teste (Describe/It/Expect) -> Seguro por design
        if (!ignoreTest && this.isInsideTest(node, sourceFile)) {
            return true;
        }

        // 2. Contexto de Log ou Telemetria -> Seguro
        if (this.isInsideLogCall(node, sourceFile)) {
            return true;
        }

        // 3. Definição de Regras ou Metadados -> Seguro
        if (this.isInsideRuleDefinition(node, sourceFile)) {
            return true;
        }

        // 4. Handlers de Exceção (Try/Catch) -> Seguro se houver Log
        if (this.isInsideSafeExceptionHandler(node, sourceFile)) {
            return true;
        }

        return false;
    }

    /**
     * Detecta chamadas a funções de execução dinâmica perigosas.
     */
    public isDangerousExecution(node: ts.Node): boolean {
        const dangerousList = ["eval", "exec", "system", "spawnSync", "execSync"];
        return ASTIntelligence.isCallTo(node, dangerousList);
    }

    private isInsideTest(node: ts.Node, sourceFile: ts.SourceFile): boolean {
        const testKeywords = ["describe", "test", "it", "expect", "beforeEach", "afterEach"];
        const chain = ASTIntelligence.getParentChain(node);
        return chain.some(parent => ASTIntelligence.isCallTo(parent, testKeywords));
    }

    private isInsideLogCall(node: ts.Node, sourceFile: ts.SourceFile): boolean {
        const chain = ASTIntelligence.getParentChain(node);
        return chain.some(parent => ASTIntelligence.isCallTo(parent, SAFE_LOG_METHODS));
    }

    private isInsideRuleDefinition(node: ts.Node, sourceFile: ts.SourceFile): boolean {
        const chain = ASTIntelligence.getParentChain(node);

        // Verifica se está dentro de classes ou métodos de análise conhecidos
        const inAnalyzer = chain.some(parent => {
            if (ts.isMethodDeclaration(parent) || ts.isFunctionDeclaration(parent)) {
                const name = parent.name?.getText() || "";
                return CORE_PERFORMANCE_FUNCS.includes(name) || ANALYZER_METHODS.includes(name);
            }
            if (ts.isClassDeclaration(parent)) {
                const name = parent.name?.getText() || "";
                return ANALYZER_CLASSES.includes(name);
            }
            return false;
        });

        if (inAnalyzer) return true;

        // Verifica atribuições a variáveis de metadados ("safe_metadata_vars")
        return chain.some(parent => {
            if (ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
                const left = parent.left.getText();
                return SAFE_METADATA_VARS.some(v => left.includes(v));
            }
            if (ts.isPropertyAssignment(parent)) {
                const name = parent.name.getText();
                return SAFE_METADATA_VARS.includes(name);
            }
            return false;
        });
    }

    private isInsideSafeExceptionHandler(node: ts.Node, sourceFile: ts.SourceFile): boolean {
        const chain = ASTIntelligence.getParentChain(node);
        const catchClause = chain.find(ts.isCatchClause);

        if (catchClause) {
            // Se houver qualquer chamada de log dentro do bloco catch, consideramos seguro
            const blockText = catchClause.block.getText().toLowerCase();
            return SAFE_LOG_METHODS.some(m => blockText.includes(m.toLowerCase()));
        }

        return false;
    }
}
