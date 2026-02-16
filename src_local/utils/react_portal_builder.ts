import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * 🛠️ REACT PORTAL BUILDER
 * Bundles the React App and injects the Ledger data.
 */

async function buildReactPortal() {
    const projectRoot = process.cwd();
    const mdPath = join(projectRoot, "docs", "auto_healing_VERIFIED.md");
    const appPath = join(projectRoot, "src_local", "dashboard", "App.tsx");
    const outputPath = join(projectRoot, "docs", "sentinel_dashboard.html");

    console.log("🚀 Iniciando build do Prototipo React SIMD...");

    try {
        const mdContent = readFileSync(mdPath, "utf-8");

        // ⚡ Bundle the React App
        const result = await Bun.build({
            entrypoints: [appPath],
            minify: true,
            target: "browser",
            define: {
                "process.env.NODE_ENV": JSON.stringify("production")
            }
        });

        if (!result.success) {
            console.error("❌ Build failed:", result.logs);
            return;
        }

        const firstOutput = result.outputs[0];
        if (!firstOutput) {
            console.error("❌ Build failed: No output generated");
            return;
        }

        const appJs = await firstOutput.text();

        const appJsSafe = appJs.replace(/<\/script>/g, "<\\/script>");

        const htmlTemplate = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏛️ Sentinel Dashboard | React Hybrid</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body, html { margin: 0; padding: 0; height: 100%; overscroll-behavior: none; }
        #root { height: 100%; }
        /* Prevent layout shift */
        body { background-color: #06090f; }
        #root:empty::before {
            content: "🏛️ Protocolo Sentinel em Inicialização...";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #4a5568;
            font-family: 'Inter', sans-serif;
            font-size: 1.2rem;
            animation: pulse 2s infinite;
        }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
    </style>
</head>
<body>
    <div id="root"></div>
    <script>
        // Injetando o Ledger MD de forma segura
        window.__MD_CONTENT__ = ${JSON.stringify(mdContent)};
        console.log("🏛️ [SENTINEL] Ledger MD Carregado:", window.__MD_CONTENT__.length, "bytes");
    </script>
    <script type="module">
        /** APP_JS_PLACEHOLDER **/
    </script>
    <script>
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (document.getElementById('root').innerHTML === "") {
                    console.error("❌ [SENTINEL] Erro Crítico: Dashboard não montou.");
                } else {
                    console.log("✅ [SENTINEL] Dashboard Montado.");
                }
            }, 1000);
        });
    </script>
</body>
</html>
        `.replace("/** APP_JS_PLACEHOLDER **/", () => appJsSafe);

        writeFileSync(outputPath, htmlTemplate, "utf-8");
        console.log(`✅ Sentinel Dashboard (React) gerado em: ${outputPath}`);

    } catch (error: any) {
        console.error("❌ Erro no build:", error.message);
    }
}

buildReactPortal();
