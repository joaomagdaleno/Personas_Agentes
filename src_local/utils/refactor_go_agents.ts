
import * as fs from 'node:fs';
import * as path from 'node:path';

function walkDir(dir: string, callback: (file: string) => void) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

const agentsDir = 'c:/Users/joaom/Documents/GitHub/Personas_Agentes/src_local/agents/Go';

walkDir(agentsDir, (file) => {
    if (!file.endsWith('.ts')) return;

    let content = fs.readFileSync(file, 'utf8');

    // Pattern to catch reasonAboutObjective implementations
    const pattern = /public override reasonAboutObjective\(objective: string, _file: string, _content: string\): string \| StrategicFinding \| null \{([\s\S]*?)\} as StrategicFinding;/g;

    const newContent = content.replace(pattern, (match, body) => {
        // Extract analysis, recommendation, and severity
        const analysisMatch = body.match(/analysis: "(.*?)",/);
        const recommendationMatch = body.match(/recommendation: "(.*?)",/);
        const severityMatch = body.match(/severity: "(.*?)"/);

        const analysis = analysisMatch ? analysisMatch[1] : "";
        const recommendation = recommendationMatch ? recommendationMatch[1] : "";
        const severity = severityMatch ? severityMatch[1] : "medium";

        return `public override reasonAboutObjective(objective: string, file: string, content: string): string | StrategicFinding | null {
        return {
            file,
            issue: \`Estratégia: \${objective}\`,
            context: content.substring(0, 200),
            objective,
            analysis: "${analysis}",
            recommendation: "${recommendation}",
            severity: "${severity}"
        } as StrategicFinding;`;
    });

    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Updated: ${file}`);
    }
});
