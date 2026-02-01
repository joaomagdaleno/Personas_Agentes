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
        """Formata o Relatório Elite 360 nativamente via composição de sub-relatórios."""
        import time
        
        report = self._format_header(health_data)
        report += self._format_risks(health_data)
        report += self._format_maturity(health_data)
        report += self._format_swot()
        report += self._format_qa_intelligence(health_data)
        report += self._format_battle_plan(audit_results)
        report += self._format_external_dependencies(audit_results)
        report += self._format_footer()
        
        return report

    def _format_external_dependencies(self, audit_results):
        ext = [i for i in audit_results if isinstance(i, dict) and i.get('context') == 'DependencyAuditor']
        if not ext: return ""
        res = "## 📦 Auditoria de Dependências Externas (.agent)\n"
        for i in ext:
            res += f"### 🚨 ALERTA: {i['file']}\n- **Veredito:** {i['issue']}\n\n"
        return res

    def _format_header(self, health_data):
        import time
        status = '🚨 RISCO CRÍTICO' if any('CRITICAL' in str(i) for i in health_data.get('ledger', {}).values()) else '✅ OPERACIONAL'
        return f"# 🏛️ DIAGNÓSTICO 360º: {health_data['objective']}\n\n**STATUS GERAL:** {status}\n**DATA:** {time.strftime('%Y-%m-%d %H:%M:%S')} | **HEALTH SCORE:** {health_data['health_score']}%\n\n"

    def _format_risks(self, health_data):
        res = "## 1. 👁️ Visão do Arquiteto (Pontos Cegos & Riscos)\n"
        res += f"### 🌑 Pontos Cegos ({len(health_data['blind_spots'])})\n"
        for spot in health_data['blind_spots'][:8]: res += f"- `{spot}`\n"
        res += f"\n### 🧪 Fragilidades & Impacto ({len(health_data['brittle_points'])})\n"
        for b in health_data['brittle_points'][:8]:
            res += f"- {'💀' if b['risk_level'] == 'EXTREME' else '⚠️'} `{b['file']}` | **Impacto:** {b['criticality']} | **Risco:** {b['risk_level']}\n"
        return res

    def _format_maturity(self, health_data):
        res = "\n## 2. 🎓 Maturidade das Personas PhD\n"
        for p in health_data['persona_maturity']:
            res += f"- {'🎓' if p['maturity'] == 'PRÁTICA' else '📚'} {p['name']}: {p['maturity']}\n"
        return res

    def _format_swot(self):
        return "\n## 3. 📊 Análise SWOT Técnica\n| **FORÇAS** | **FRAQUEZAS** |\n| :--- | :--- |\n| Modularidade PhD | Gaps de paridade |\n| Autoconsciência Nativa | Entropia Lógica |\n| **OPORTUNIDADES** | **AMEAÇAS** |\n| :--- | :--- |\n| Auto-Cura Determinística | Vulnerabilidades de Injeção |\n| Memória de Estabilidade | Complexidade Core |\n\n"

    def _format_qa_intelligence(self, health_data):
        py = health_data.get("pyramid", {})
        ex = health_data.get("test_execution", {})
        if not py.get("total"): return ""
        
        res = "## 🧪 Inteligência de QA: Pirâmide e Execução\n"
        # Meta de 90% para o ícone de sucesso
        status_icon = "✅" if ex.get("pass_rate", 0) >= 90 else "❌"
        res += f"### {status_icon} STATUS: {'OPERACIONAL' if ex.get('pass_rate', 0) >= 90 else 'ATENÇÃO'} ({ex.get('pass_rate', 0)}%)\n"
        res += f"- **Bateria:** {ex.get('total_run', 0)} executados | **Unitários:** {round(py['unit']/py['total']*100)}%\n\n"
        
        if ex.get("details"):
            res += "### 🔍 Detalhes das Falhas\n"
            for d in ex["details"][:5]:
                res += f"- `{d['test']}`: {d['error']}\n"
        return res

    def _format_battle_plan(self, audit_results):
        # Segregação inteligente: Ativos vs Cicatrizes (Healed)
        active = [i for i in audit_results if not isinstance(i, dict) or i.get('severity') != 'HEALED']
        scars = [i for i in audit_results if isinstance(i, dict) and i.get('severity') == 'HEALED']
        
        res = "## 4. 🎯 Plano de Batalha: Alvos Ativos\n"
        if not active:
            res += "*Nenhum risco ativo detectado. Sistema em estado de Graça.*\n\n"
        else:
            for i, item in enumerate(active[:15], 1):
                if isinstance(item, dict):
                    res += f"### {i}. [{str(item.get('severity', 'LOW')).upper()}] {item.get('context')} @ `{item.get('file')}`\n- **Veredito:** {item.get('issue')}\n\n"
                else:
                    res += f"### {i}. [UNKNOWN] Strategic @ `DNA`\n- **Veredito:** {item}\n\n"
        
        if scars:
            res += "## 🧬 Memória de Cicatrizes (Histórico de Curas)\n"
            res += "> Registros de batalhas passadas que foram vencidas e curadas.\n\n"
            for i, scar in enumerate(scars[:10], 1):
                res += f"- **{scar.get('file')}**: {scar.get('issue')} (Curado ✅)\n"
        
        return res

    def _format_footer(self):
        return "## 💀 Risco Existencial\n> O sistema agora possui autoconsciência nativa e memória de cicatrizes. A prioridade é reduzir a complexidade core para garantir a escalabilidade da inteligência.\n"

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
