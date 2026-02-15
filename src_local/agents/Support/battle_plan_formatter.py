"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Formatador de Plano de Batalha (BattlePlanFormatter)
Função: Especialista em estruturar diretrizes de engenharia.
"""
import logging

logger = logging.getLogger(__name__)

class BattlePlanFormatter:
    """Assistente Técnico: Especialista em Roteiros de Cura 🎯"""
    
    def format(self, audit_results: list) -> str:
        """Estrutura os resultados da auditoria em um plano de batalha hierárquico."""
        from src_local.agents.Support.battle_plan_sections_engine import BattlePlanSectionsEngine
        self.engine = BattlePlanSectionsEngine()
        
        active = self.engine.filter_active_results(audit_results, self._get_item_key)
        if not active: return "## 🎯 PLANO DE BATALHA\n\n> ✅ Nenhuma intervenção necessária."

        categories = self._group_by_severity(active)
        sections = [
            "## 🎯 PLANO DE BATALHA: DIRETRIZES DE ENGENHARIA",
            self._format_impact_summary(categories), "---"
        ]

        for sev in ["CRITICAL", "HIGH", "MEDIUM", "LOW", "STRATEGIC"]:
            sections.append(self._format_section_if_active(sev, categories[sev]))
        
        return "\n\n".join(s.strip() for s in sections if s).strip()

    def _format_section_if_active(self, sev, items):
        """Formata uma seção de severidade apenas se contiver itens."""
        if not items: return ""
        return self.engine.format_severity_group(sev, items, self._format_item)


    def _get_item_key(self, item):
        if isinstance(item, dict):
            c_issue = str(item.get('issue', '')).rstrip('.')
            return f"{item.get('file')}:{item.get('line')}:{c_issue}"
        return str(item).rstrip('.')

    def _group_by_severity(self, active_items):
        cats = {"CRITICAL": [], "HIGH": [], "MEDIUM": [], "LOW": [], "STRATEGIC": []}
        for item in active_items:
            sev = item.get('severity', 'MEDIUM').upper() if isinstance(item, dict) else "STRATEGIC"
            if sev in cats: cats[sev].append(item)
            else: cats["MEDIUM"].append(item)
        return cats

    def _format_impact_summary(self, cats):
        res = "### 📊 RESUMO DE INTERVENÇÕES\n\n| Severidade | Quantidade |\n| :--- | :---: |\n"
        for s in ["CRITICAL", "HIGH", "MEDIUM", "LOW", "STRATEGIC"]:
            if len(cats[s]) > 0: res += f"| {s} | {len(cats[s])} |\n"
        return res.strip()


    def _format_item(self, item, sev):
        if not isinstance(item, dict):
            return f"- **Diretriz Estratégica:** {str(item).rstrip('.').strip()}\n\n"
        
        issue_clean = str(item.get('issue', '')).rstrip('.').strip()
        line = item.get('line', 'N/A')
        file_id = str(item.get('file', '')).replace('.', '_').replace('\\', '/')
        
        res = f"#### 🔴 Item {line}: {issue_clean} [ID: {file_id}_{line}]\n\n"
        if item.get('snippet'):
            res += f"- **Evidência:**\n\n```python\n{str(item.get('snippet')).strip()}\n```\n\n"
            
        if item.get('ai_insight'):
            res += f"> 🧠 **TestRefiner (AI Insight):**\n> {str(item.get('ai_insight')).replace(chr(10), chr(10)+'> ')}\n\n"
            
        return res + f"- **Diretriz:** Padrão soberano de {sev.lower()}\n\n"