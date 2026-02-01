from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class DirectorPersona(BaseActivePersona):
    """
    Model: O Diretor.
    Responsável pela estratégia e formatação da comunicação com o Gemini.
    """
    def __init__(self, project_root=None):
        super().__init__(project_root)
        self.name = "Director"
        self.emoji = "🏛️"
        self.role = "Master Orchestrator"
        self.mission = "Drive specialized agents to project excellence."

    def perform_audit(self):
        return []

    def _reason_about_objective(self, objective, file, content):
        """O Diretor não realiza raciocínio individual em arquivos, ele sintetiza."""
        return None

    def format_360_report(self, health_data, audit_results):
        """
        Formata o Relatório Elite 360 nativamente.
        """
        import time
        report = f"# 🏛️ DIAGNÓSTICO 360º: {health_data['objective']}\n\n"
        
        # Resiliência para audit_results que podem conter strings
        has_critical = any(
            (isinstance(i, dict) and i.get('severity') == 'CRITICAL') or 
            (isinstance(i, str) and 'CRITICAL' in i) 
            for i in audit_results
        )
        
        status = '🚨 RISCO CRÍTICO' if has_critical else '✅ OPERACIONAL'
        report += f"**STATUS GERAL:** {status}\n"
        report += f"**DATA:** {time.strftime('%Y-%m-%d %H:%M:%S')} | **HEALTH SCORE:** {health_data['health_score']}%\n\n"

        report += "## 1. 👁️ Visão do Arquiteto (Pontos Cegos & Riscos)\n"
        report += f"### 🌑 Pontos Cegos ({len(health_data['blind_spots'])})\n"
        for spot in health_data['blind_spots'][:8]: report += f"- `{spot}`\n"
        
        report += f"\n### 🧪 Fragilidades & Impacto ({len(health_data['brittle_points'])})\n"
        for brittle in health_data['brittle_points'][:8]: 
            risk_icon = "💀" if brittle['risk_level'] == "EXTREME" else "⚠️"
            report += f"- {risk_icon} `{brittle['file']}` | **Impacto:** {brittle['criticality']} | **Risco:** {brittle['risk_level']}\n"

        # Componentes Crônicos (aqueles que sempre aparecem no ledger)
        chronic = [f for f, data in health_data['ledger'].items() if data['occurrences'] > 3]
        if chronic:
            report += f"\n### 🧬 Alerta: Componentes Crônicos ({len(chronic)})\n"
            report += "Estes arquivos apresentam falhas recorrentes e podem precisar de refatoração:\n"
            for f in chronic[:5]: report += f"- `❌ {f}`\n"

        report += f"\n### 🌌 Matéria Escura ({len(health_data['dark_matter'])})\n"
        for dark in health_data['dark_matter'][:8]: report += f"- `{dark}`\n"

        report += "\n## 2. 🎓 Maturidade das Personas PhD\n"
        for p in health_data['persona_maturity']:
            status_icon = "🎓" if p['maturity'] == "PRÁTICA" else "📚"
            report += f"- {status_icon} {p['name']}: {p['maturity']}\n"

        report += "\n## 3. 📊 Análise SWOT Técnica\n"
        report += "| **FORÇAS** | **FRAQUEZAS** |\n| :--- | :--- |\n"
        report += "| Modularidade PhD | Gaps de paridade (Flutter/Kotlin) |\n"
        report += "| Autoconsciência Nativa | Silenciamento de Erros |\n"
        report += "| **OPORTUNIDADES** | **AMEAÇAS** |\n| :--- | :--- |\n"
        report += "| Auto-Cura via Forge/Voyager | Vulnerabilidades de Injeção |\n"
        report += "| Telemetria unificada | Dependência de Estados Globais |\n\n"

        # Nova Seção: Inteligência de QA (Pirâmide e Execução)
        py = health_data.get("pyramid", {})
        exec_data = health_data.get("test_execution", {})
        
        if py.get("total", 0) > 0:
            report += "## 🧪 Inteligência de QA: Pirâmide e Execução\n"
            
            # Status de Execução Real
            if exec_data.get("success"):
                report += f"### ✅ STATUS: TESTES PASSANDO ({exec_data['pass_rate']}%)\n"
            else:
                report += f"### ❌ STATUS: TESTES FALHANDO ({exec_data.get('passed', 0)}/{exec_data.get('total_run', 0)})\n"
            
            report += f"- **Bateria de Testes:** {exec_data.get('total_run', 0)} executados.\n"
            report += f"- **Unitários (Meta 70%):** {py['unit']} ({round(py['unit']/py['total']*100)}%)\n"
            report += f"- **Integração (Meta 20%):** {py['integration']} ({round(py['integration']/py['total']*100)}%)\n"
            report += f"- **E2E (Meta 10%):** {py['e2e']} ({round(py['e2e']/py['total']*100)}%)\n\n"
            
            # Detalhamento de Falhas (Se houver)
            if not exec_data.get("success") and exec_data.get("details"):
                report += "### 🔍 Análise de Causa Raiz das Falhas\n"
                for detail in exec_data["details"]:
                    report += f"- **Teste:** `{detail['test']}`\n"
                    report += f"  - **Erro:** `{detail['error']}`\n"
                    report += f"  - **💡 Resolução:** {detail['resolution']}\n\n"
            
            # Veredito da Pirâmide
            if py['unit'] / py['total'] < 0.5:
                report += "> ⚠️ **Alerta do Diretor:** Pirâmide invertida detectada! O projeto depende muito de testes pesados. Aumente os testes unitários para acelerar a Auto-Cura.\n\n"

        report += "## 4. 🎯 Plano de Batalha: Top Ocorrências\n"
        for i, item in enumerate(audit_results[:30], 1):
            if isinstance(item, dict):
                severity = str(item.get('severity', 'LOW')).upper()
                agent = item.get('context', 'PhD Agent')
                target = item.get('file', 'N/A')
                issue = item.get('issue', 'N/A')
                report += f"### {i}. [{severity}] {agent} @ `{target}`\n"
                report += f"- **Veredito:** {issue}\n\n"
            else:
                report += f"### {i}. [UNKNOWN] Strategic @ `Project DNA`\n"
                report += f"- **Veredito:** {item}\n\n"

        report += "## 💀 Risco Existencial\n"
        report += "> O projeto agora possui autoconsciência nativa. A prioridade é eliminar os pontos cegos para que o Orquestrador possa agir com total visibilidade.\n"
        
        return report

    def format_mission(self, issues, stage, metrics, objective=None):
        """Formata o pacote de missão com análise de causa raiz."""
        duration = round(metrics['end_time'] - metrics['start_time'], 2)
        
        if objective:
            report = f"# 🏛️ ANÁLISE DE CAUSA RAIZ: {objective}\n"
            report += f"**Diagnóstico Estratégico** | **Audit Time:** {duration}s\n\n"
            report += "## 🧠 CONCLUSÃO DO DIRETOR\n"
            
            if not issues:
                report += "❌ **ALERTA:** Os agentes não encontraram nenhuma estrutura que suporte este objetivo. O sistema pode estar faltando componentes fundamentais.\n"
            else:
                report += f"Após cruzar os dados de {len(issues)} pontos de falha, detectamos uma quebra na cadeia funcional.\n\n"
        else:
            report = f"# 🏛️ BRIEFING DE MISSÃO: {stage}\n"
            report += f"**Status do Projeto:** {metrics['health_score']}% Saudável | **Tempo de Varredura:** {duration}s\n"

        if not issues:
            return report + "✅ Projeto em conformidade técnica total."

        # Agrupamento e formatação...
        grouped = {}
        for iss in issues:
            file = iss.get('file', 'Global')
            if file not in grouped: grouped[file] = []
            grouped[file].append(iss)

        for file, file_issues in grouped.items():
            report += f"## 🎯 ALVO: `{file}`\n"
            for i, iss in enumerate(file_issues):
                severity = iss.get('severity', 'medium').upper()
                report += f"{i+1}. **[{severity}]** {iss['issue']}\n"
                if 'snippet' in iss:
                    report += f"   - *Contexto:* `{iss['snippet']}`\n"
            report += "\n---\n"
        
        return report

    def get_system_prompt(self):
        return f"You are the Director 🏛️. Your mission is: {self.mission}"
