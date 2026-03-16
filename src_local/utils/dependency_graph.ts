import * as fs from 'fs';
import * as path from 'path';
import winston from 'winston';

/**
 * 📊 Grafo de Dependências (Fan-In Analyzer).
 * 
 * Constrói um mapa de quem importa quem no projeto para determinar:
 * - Fan-In alto (muitos módulos importam X) → candidato ideal para E2E test
 * - Pares de dependência mútua → candidatos para Integration test
 * - Módulos isolados → candidatos para Unit test
 */

export interface DependencyNode {
    file: string;          // Caminho relativo do arquivo
    imports: string[];     // Quem este arquivo importa
    importedBy: string[];  // Quem importa este arquivo (fan-in)
    fanIn: number;         // Contagem de fan-in
    fanOut: number;        // Contagem de fan-out
    isHub: boolean;        // Se é um módulo hub (fan-in >= 4)
}

export interface DependencyGraphResult {
    nodes: Map<string, DependencyNode>;
    e2eCandidates: string[];                  // Top fan-in → alvos E2E
    integrationPairs: Array<[string, string]>; // Pares de interação real → alvos Integration
    isolatedModules: string[];                 // Módulos sem fan-in → alvos Unit
}

export class DependencyGraph {
    private projectRoot: string;
    private nodes: Map<string, DependencyNode> = new Map();

    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
    }

    /**
     * Constrói o grafo completo de dependências do diretório especificado.
     */
    build(srcDir: string = 'src_local'): DependencyGraphResult {
        const rootPath = path.join(this.projectRoot, srcDir);
        this.nodes.clear();

        // Passo 1: Coletar todos os arquivos fonte (.ts, excluindo testes)
        const sourceFiles: string[] = [];
        this.walkDir(rootPath, (filePath: string) => {
            const name = path.basename(filePath);
            if (name.endsWith('.ts') && !name.endsWith('.test.ts')) {
                sourceFiles.push(filePath);
            }
        });

        // Passo 2: Inicializar nós
        for (const file of sourceFiles) {
            const relPath = path.relative(this.projectRoot, file);
            this.nodes.set(relPath, {
                file: relPath,
                imports: [],
                importedBy: [],
                fanIn: 0,
                fanOut: 0,
                isHub: false,
            });
        }

        // Passo 3: Parsear imports de cada arquivo
        for (const file of sourceFiles) {
            const relPath = path.relative(this.projectRoot, file);
            const node = this.nodes.get(relPath)!;

            try {
                const content = fs.readFileSync(file, 'utf-8');
                const imports = this.extractImports(content, file);

                for (const imp of imports) {
                    const resolvedRel = path.relative(this.projectRoot, imp);
                    node.imports.push(resolvedRel);
                    node.fanOut++;

                    // Registrar fan-in no nó alvo
                    const targetNode = this.nodes.get(resolvedRel);
                    if (targetNode) {
                        targetNode.importedBy.push(relPath);
                        targetNode.fanIn++;
                    }
                }
            } catch { /* skip unreadable files */ }
        }

        // Passo 4: Marcar hubs (fan-in >= 4)
        for (const node of this.nodes.values()) {
            node.isHub = node.fanIn >= 4;
        }

        // Passo 5: Determinar candidatos
        const sortedByFanIn = [...this.nodes.values()]
            .filter(n => n.fanIn > 0)
            .sort((a, b) => b.fanIn - a.fanIn);

        // E2E: Top 5% por fan-in (módulos mais importados = mais críticos)
        const e2eCount = Math.max(1, Math.ceil(this.nodes.size * 0.05));
        const e2eCandidates = sortedByFanIn.slice(0, e2eCount).map(n => n.file);

        // Integration: pares com dependência mútua ou alta interação
        const integrationPairs = this.findStrongestPairs(sortedByFanIn);

        // Isolated: módulos com fan-in = 0 (ninguém os importa)
        const isolatedModules = [...this.nodes.values()]
            .filter(n => n.fanIn === 0 && n.fanOut > 0)
            .map(n => n.file);

        winston.info(`📊 [DependencyGraph] ${this.nodes.size} módulos analisados. Hubs: ${sortedByFanIn.filter(n => n.isHub).length}. E2E candidates: ${e2eCandidates.length}. Integration pairs: ${integrationPairs.length}.`);

        return {
            nodes: this.nodes,
            e2eCandidates,
            integrationPairs,
            isolatedModules,
        };
    }

    /**
     * Encontra os pares de módulos com maior interação para testes de integração.
     * Prioriza: dependência mútua > hub importando outro hub > hub importando folha
     */
    private findStrongestPairs(sortedByFanIn: DependencyNode[]): Array<[string, string]> {
        const pairs: Array<[string, string]> = [];
        const seen = new Set<string>();

        // Prioridade 1: Dependência mútua (A importa B E B importa A)
        for (const node of this.nodes.values()) {
            for (const imp of node.imports) {
                const targetNode = this.nodes.get(imp);
                if (targetNode && targetNode.imports.includes(node.file)) {
                    const key = [node.file, imp].sort().join('|');
                    if (!seen.has(key)) {
                        seen.add(key);
                        pairs.push([node.file, imp]);
                    }
                }
            }
        }

        // Prioridade 2: Hub importando outro hub
        for (const hub of sortedByFanIn.filter(n => n.isHub)) {
            for (const imp of hub.imports) {
                const targetNode = this.nodes.get(imp);
                if (targetNode && targetNode.isHub) {
                    const key = [hub.file, imp].sort().join('|');
                    if (!seen.has(key)) {
                        seen.add(key);
                        pairs.push([hub.file, imp]);
                    }
                }
            }
        }

        // Prioridade 3: Hub importando folha de alto uso
        for (const hub of sortedByFanIn.filter(n => n.isHub).slice(0, 10)) {
            for (const imp of hub.imports.slice(0, 3)) {
                const key = [hub.file, imp].sort().join('|');
                if (!seen.has(key)) {
                    seen.add(key);
                    pairs.push([hub.file, imp]);
                }
            }
        }

        return pairs.slice(0, 20); // Limitar a 20 pares
    }

    /**
     * Extrai imports relativos de um arquivo TypeScript.
     */
    private extractImports(code: string, filePath: string): string[] {
        const results: string[] = [];
        const regex = /from\s+['"](\.[^'"]+)['"]/g;
        let match;

        while ((match = regex.exec(code)) !== null) {
            let importPath = match[1];
            if (!importPath.endsWith('.ts')) importPath += '.ts';

            const resolved = path.resolve(path.dirname(filePath), importPath);
            if (fs.existsSync(resolved)) {
                results.push(resolved);
            }
        }

        return results;
    }

    private walkDir(dir: string, callback: (filePath: string) => void) {
        if (!fs.existsSync(dir)) return;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (['node_modules', '.git', 'target', 'build', '.gemini'].includes(entry.name)) continue;
                this.walkDir(fullPath, callback);
            } else {
                callback(fullPath);
            }
        }
    }
}
