import * as ts from "typescript";
import { ObfuscationLogicEngine } from "./obfuscation_logic_engine";
import winston from 'winston';

/**
 * 🕵️ Caçador de Ofuscação (ObfuscationHunter)
 * Especialista em detectar reconstrução de strings perigosas via AST do TypeScript.
 */
export class ObfuscationHunter {
    private engine: ObfuscationLogicEngine;
    private logger = winston.loggers.get('default_logger') || winston;

    constructor() {
        this.engine = new ObfuscationLogicEngine();
    }

    /**
     * Varredura de ofuscação em arquivos TypeScript/JavaScript.
     */
    scanFile(filePath: string, content: string): any[] {
        // Whitelist PhD
        const skipList = [
            'safety_definitions.ts', 'integrity_guardian.ts', 'base_persona.ts'
        ];
        if (skipList.some(f => filePath.includes(f))) return [];

        try {
            const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
            return this.scanNode(sourceFile, sourceFile);
        } catch (error) {
            this.logger.error(`❌ [ObfuscationHunter] Erro ao processar AST de ${filePath}: ${error}`);
            return [];
        }
    }

    private scanNode(node: ts.Node, sourceFile: ts.SourceFile): any[] {
        let findings: any[] = [];

        if (this.isAdditionNode(node)) {
            const resolved = this.engine.resolveConstant(this.mapToSimpleNode(node));
            if (resolved) {
                const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                const finding = this.engine.checkDangerousKeywords(line + 1, resolved, this.mapToSimpleNode(node));
                if (finding) findings.push(finding);
            }
        }

        ts.forEachChild(node, child => {
            findings = findings.concat(this.scanNode(child, sourceFile));
        });

        return findings;
    }

    private isAdditionNode(node: ts.Node): boolean {
        return ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken;
    }

    /**
     * Mapeia um nó do TS para o formato simples esperado pelo ObfuscationLogicEngine.
     */
    private mapToSimpleNode(node: ts.Node): any {
        if (ts.isStringLiteral(node)) {
            return { type: 'StringLiteral', value: node.text };
        }
        if (ts.isBinaryExpression(node)) {
            return {
                type: 'BinaryExpression',
                operator: '+',
                left: this.mapToSimpleNode(node.left),
                right: this.mapToSimpleNode(node.right)
            };
        }
        return { type: 'Unknown' };
    }
}
