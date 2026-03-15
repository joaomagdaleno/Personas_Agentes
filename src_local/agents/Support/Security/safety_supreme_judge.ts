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
        const checks = [
            () => !ignoreTest && this.isInsideTest(node, sourceFile),
            () => this.isInsideLogCall(node, sourceFile),
            () => this.isInsideRuleDefinition(node, sourceFile),
            () => this.isInsideSafeExceptionHandler(node, sourceFile)
        ];

        return checks.some(check => check());
    }

    public isDangerousExecution(node: ts.Node): boolean {
        return ASTIntelligence.isCallTo(node, ["eval", "exec", "system", "spawnSync", "execSync"]);
    }

    private isInsideTest(node: ts.Node, sourceFile: ts.SourceFile): boolean {
        return ASTIntelligence.getParentChain(node).some(p => ASTIntelligence.isCallTo(p, ["describe", "test", "it", "expect", "beforeEach", "afterEach"]));
    }

    private isInsideLogCall(node: ts.Node, sourceFile: ts.SourceFile): boolean {
        return ASTIntelligence.getParentChain(node).some(p => ASTIntelligence.isCallTo(p, SAFE_LOG_METHODS));
    }

    private isInsideRuleDefinition(node: ts.Node, sourceFile: ts.SourceFile): boolean {
        const chain = ASTIntelligence.getParentChain(node);
        return this._isAnalyzerContext(chain) || this._isMetadataAssignment(chain);
    }

    private _isAnalyzerContext(chain: ts.Node[]): boolean {
        return chain.some(parent => {
            const name = this.getNodeName(parent);
            return CORE_PERFORMANCE_FUNCS.includes(name) || ANALYZER_METHODS.includes(name) || ANALYZER_CLASSES.includes(name);
        });
    }

    private getNodeName(node: ts.Node): string {
        if (ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) {
            return (node as any).name?.getText() || "";
        }
        return "";
    }

    private _isMetadataAssignment(chain: ts.Node[]): boolean {
        return chain.some(parent => {
            const isBin = ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken && SAFE_METADATA_VARS.some(v => parent.left.getText().includes(v));
            const isProp = ts.isPropertyAssignment(parent) && SAFE_METADATA_VARS.includes(parent.name.getText());
            return isBin || isProp;
        });
    }

    private isInsideSafeExceptionHandler(node: ts.Node, sourceFile: ts.SourceFile): boolean {
        const catchClause = ASTIntelligence.getParentChain(node).find(ts.isCatchClause);
        if (!catchClause) return false;

        const catchText = catchClause.block.getText().toLowerCase();
        return SAFE_LOG_METHODS.some(m => catchText.includes(m.toLowerCase()));
    }

    public is_dangerous_call(node: ts.Node): boolean {
        return this.isDangerousExecution(node);
    }

    public is_meta_analysis_node(node: ts.Node, sourceFile: ts.SourceFile): boolean {
        const t = node.getText();
        return ["ts.createSourceFile", "ts.forEachChild", "eval(", "new Function("].some(v => t.includes(v));
    }
}
