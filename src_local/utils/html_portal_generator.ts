import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * 🚀 PROFESSIONAL GOVERNANCE PORTAL GENERATOR (BUN SIMD)
 * Evolved multi-screen dashboard with sidebar navigation.
 */

async function generateProfessionalPortal() {
    const projectRoot = process.cwd();
    const mdPath = join(projectRoot, "docs", "auto_healing_VERIFIED.md");
    const htmlOutputPath = join(projectRoot, "docs", "governance_portal.html");

    console.log("🚀 Evoluindo Portal para Dashboard Profissional...");

    try {
        const mdContent = readFileSync(mdPath, "utf-8");

        // ⚡ Bun SIMD Rendering
        // @ts-ignore
        const renderedHtml = Bun.markdown.html(mdContent);

        const fullHtml = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏛️ PhD Governance Sentinel | Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --sidebar-width: 280px;
            --bg-deep: #06090f;
            --bg-surface: #0d1117;
            --bg-card: rgba(22, 27, 34, 0.7);
            --accent: #58a6ff;
            --accent-glow: rgba(88, 166, 255, 0.3);
            --success: #3fb950;
            --warning: #d29922;
            --danger: #f85149;
            --text-primary: #c9d1d9;
            --text-secondary: #8b949e;
            --border: rgba(255, 255, 255, 0.1);
            --glass: blur(12px);
        }

        * { box-sizing: border-box; }

        body {
            background-color: var(--bg-deep);
            color: var(--text-primary);
            font-family: 'Inter', sans-serif;
            margin: 0;
            display: flex;
            height: 100vh;
            overflow: hidden;
        }

        /* Sidebar */
        .sidebar {
            width: var(--sidebar-width);
            background-color: var(--bg-surface);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            padding: 24px;
            z-index: 100;
        }

        .brand {
            font-weight: 800;
            font-size: 1.25rem;
            color: white;
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 48px;
        }

        .nav-items {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .nav-link {
            padding: 12px 16px;
            border-radius: 8px;
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .nav-link:hover {
            color: white;
            background-color: rgba(255, 255, 255, 0.05);
        }

        .nav-link.active {
            color: var(--accent);
            background-color: rgba(88, 166, 255, 0.1);
            border: 1px solid var(--border);
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: var(--success);
            box-shadow: 0 0 10px var(--success);
        }

        /* Main Content */
        .main {
            flex: 1;
            padding: 48px;
            overflow-y: auto;
            background: linear-gradient(135deg, var(--bg-deep) 0%, #0a0d14 100%);
        }

        .screen {
            display: none;
            animation: fadeIn 0.4s ease-out;
            max-width: 1100px;
            margin: 0 auto;
        }

        .screen.active { display: block; }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Glass Cards */
        .card {
            background: var(--bg-card);
            backdrop-filter: var(--glass);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        h1, h2, h3 { color: white; margin-top: 0; }
        h1 { font-size: 2.5rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 32px; }
        h2 { font-size: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-top: 40px; }

        /* Tables & Lists */
        table { width: 100%; border-collapse: collapse; margin: 24px 0; }
        th { text-align: left; color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; padding: 12px; border-bottom: 1px solid var(--border); }
        td { padding: 16px 12px; border-bottom: 1px solid var(--border); font-size: 0.93rem; }
        code { font-family: 'JetBrains Mono', monospace; font-size: 0.85em; background: rgba(88, 166, 255, 0.1); color: var(--accent); padding: 3px 6px; border-radius: 4px; }

        /* Specialized components */
        .grid-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; margin-bottom: 48px; }
        .stat-box { background: var(--bg-card); border: 1px solid var(--border); padding: 24px; border-radius: 12px; text-align: center; }
        .stat-value { font-size: 2rem; font-weight: 800; color: white; }
        .stat-label { font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; }

        blockquote { border-left: 4px solid var(--accent); background: rgba(88, 166, 255, 0.05); margin: 24px 0; padding: 16px 24px; border-radius: 0 12px 12px 0; }
        
        /* Hide MD elements we'll swap locally */
        #md-source { display: none; }

        /* Typography */
        p { color: var(--text-secondary); line-height: 1.7; }
        li { margin-bottom: 12px; }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #484f58; }
    </style>
</head>
<body>
    <aside class="sidebar">
        <div class="brand">
            <div class="status-dot"></div>
            SENTINEL PHD
        </div>
        <nav class="nav-items">
            <a class="nav-link active" onclick="showScreen('dashboard')">📊 Dashboard</a>
            <a class="nav-link" onclick="showScreen('governance')">⚖️ Governança</a>
            <a class="nav-link" onclick="showScreen('findings')">🚩 Achados</a>
            <a class="nav-link" onclick="showScreen('topology')">🗺️ Topologia</a>
        </nav>
        <div style="flex:1"></div>
        <div style="font-size: 0.7rem; color: var(--text-secondary); opacity: 0.5;">
            v1.4.0-SOVEREIGN<br>
            BUN SIMD ACCEL
        </div>
    </aside>

    <main class="main">
        <!-- Root for MD parser -->
        <div id="md-source">${renderedHtml}</div>

        <!-- Dashboard Screen -->
        <section id="dashboard" class="screen active">
            <h1>Visão Geral do Sistema</h1>
            <div class="grid-stats">
                <div class="stat-box">
                    <div id="health-val" class="stat-value">--</div>
                    <div class="stat-label">SAÚDE SISTÊMICA</div>
                </div>
                <div class="stat-box">
                    <div id="findings-count" class="stat-value">--</div>
                    <div class="stat-label">ALERTAS ATIVOS</div>
                </div>
                <div class="stat-box">
                    <div id="compliance-level" class="stat-value" style="color:var(--accent)">--</div>
                    <div class="stat-label">COMPLIANCE PHD</div>
                </div>
            </div>
            
            <div class="card" id="main-metrics-root">
                <!-- Swapped via JS from MD -->
            </div>
        </section>

        <!-- Governance Screen -->
        <section id="governance" class="screen">
            <h1>Diretrizes & Governança</h1>
            <div id="governance-root"></div>
        </section>

        <!-- Findings Screen -->
        <section id="findings" class="screen">
            <h1>Audit Log & Achados</h1>
            <div id="findings-root"></div>
        </section>

        <!-- Topology Screen -->
        <section id="topology" class="screen">
            <h1>Topology & Sync Status</h1>
            <div id="topology-root"></div>
        </section>
    </main>

    <script>
        function showScreen(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.getElementById(id).classList.add('active');
            event.currentTarget.classList.add('active');
        }

        // 🧠 Dynamic Data Extraction from SIMD-rendered Markdown
        function bootstrap() {
            const source = document.getElementById('md-source');
            
            // Extract Metrics
            const h1 = source.querySelector('h1');
            const metricsTable = source.querySelector('table');
            if (metricsTable) {
                document.getElementById('main-metrics-root').appendChild(metricsTable.cloneNode(true));
                const healthTd = Array.from(metricsTable.querySelectorAll('td')).find(td => td.innerText.includes('Integridade Geral'));
                if (healthTd) {
                    const next = healthTd.nextElementSibling;
                    document.getElementById('health-val').innerText = next.innerText.split(' ').pop();
                }
                const findingsTd = Array.from(metricsTable.querySelectorAll('td')).find(td => td.innerText.includes('Alertas Ativos'));
                if (findingsTd) {
                    document.getElementById('findings-count').innerText = findingsTd.nextElementSibling.innerText.split(' ')[0];
                }
            }

            // Extract Governance
            const govHeaders = Array.from(source.querySelectorAll('h3')).filter(h => h.innerText.includes('DIRETRIZES'));
            if (govHeaders.length) {
                const root = document.getElementById('governance-root');
                govHeaders.forEach(h => {
                    let next = h.nextElementSibling;
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.appendChild(h.cloneNode(true));
                    while(next && next.tagName !== 'H2' && next.tagName !== 'H3') {
                        card.appendChild(next.cloneNode(true));
                        next = next.nextElementSibling;
                    }
                    root.appendChild(card);
                });
            }

            // Extract Findings
            const findingsHeader = Array.from(source.querySelectorAll('h2')).find(h => h.innerText.includes('ACHADOS'));
            if (findingsHeader) {
                const root = document.getElementById('findings-root');
                let next = findingsHeader.nextElementSibling;
                while(next && next.tagName !== 'H2') {
                    if (next.tagName === 'BLOCKQUOTE') {
                        const card = document.createElement('div');
                        card.className = 'card';
                        card.style.padding = '20px';
                        card.appendChild(next.cloneNode(true));
                        root.appendChild(card);
                    }
                    next = next.nextElementSibling;
                }
            }

            // Extract Topology
            const topologyHeader = Array.from(source.querySelectorAll('h2')).find(h => h.innerText.includes('TOPOLOGIA'));
            if (topologyHeader) {
                const root = document.getElementById('topology-root');
                const card = document.createElement('div');
                card.className = 'card';
                card.appendChild(topologyHeader.cloneNode(true));
                let next = topologyHeader.nextElementSibling;
                while(next && next.tagName !== 'H2') {
                    card.appendChild(next.cloneNode(true));
                    next = next.nextElementSibling;
                }
                root.appendChild(card);
            }

            // Auto-populate compliance
            const compTd = Array.from(source.querySelectorAll('td')).find(td => td.innerText.includes('Compliance'));
            if (compTd) {
                document.getElementById('compliance-level').innerText = compTd.nextElementSibling.innerText.split(' ').pop();
            }
        }

        window.onload = bootstrap;
    </script>
</body>
</html>
        `;

        writeFileSync(htmlOutputPath, fullHtml);
        console.log(`✅ Professional Portal gerado em: ${htmlOutputPath}`);

    } catch (error: any) {
        console.error("❌ Erro:", error.message);
    }
}

generateProfessionalPortal();
