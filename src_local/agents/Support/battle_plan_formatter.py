"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Formatador de Plano de Batalha (BattlePlanFormatter)
Função: Especialista em estruturar diretrizes de engenharia.
"""
import logging

logger = logging.getLogger(__name__)

class BattlePlanFormatter:
    """
    Assistente Técnico: Especialista em Roteiros de Cura 🎯
    Extraído do ReportFormatter para reduzir entropia.
    """
    
    def format(self, audit_results: list) -> str:
        """Estrutura os resultados da auditoria em um plano de batalha hierárquico."""
        # Rigorosa deduplicação PhD
        dedup = []
        seen = set()
        for i in audit_results:
            if isinstance(i, dict):
                # Normalização para evitar MD024
                c_issue = str(i.get('issue', '')).rstrip('.')
                key = f"{i.get('file')}:{i.get('line')}:{c_issue}"
                if key not in seen:
                    dedup.append(i)
                    seen.add(key)
            elif i not in seen:
                key = str(i).rstrip('.')
                if key not in seen:
                    dedup.append(i)
                    seen.add(key)

        active = [i for i in dedup if not isinstance(i, dict) or i.get('severity') != 'HEALED']
        if not active: return "## 🎯 PLANO DE BATALHA\n\n> ✅ Nenhuma intervenção necessária."

        sections = ["## 🎯 PLANO DE BATALHA: DIRETRIZES DE ENGENHARIA"]
        categories = self._group_by_severity(active)
        sections.append(self._format_impact_summary(categories))
        sections.append("---") # Separador isolado para garantir MD012/MD022

        for sev in ["CRITICAL", "HIGH", "MEDIUM", "LOW", "STRATEGIC"]:
            if categories[sev]:
                sections.append(self._format_severity_group(sev, categories[sev]))
        
        return "\n\n".join(s.strip() for s in sections if s).strip()

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

    def _format_severity_group(self, sev, items):
        res = f"## 🚩 NÍVEL: {sev}\n\n"
        file_groups = {}
        for item in items:
            fname = item.get('file', 'Global') if isinstance(item, dict) else "DNA"
            if fname not in file_groups: file_groups[fname] = []
            file_groups[fname].append(item)

        for fname, group in file_groups.items():
            # Título único para MD024: Inclui severidade no nível do arquivo
            res += f"### 📂 Alvo: `{fname}` [{sev}]\n\n"
            for item in group:
                res += self._format_item(item, sev)
        return res.strip()

    def _format_item(self, item, sev):
        if not isinstance(item, dict):
            clean_guideline = str(item).rstrip('.').strip()
            return f"- **Diretriz Estratégica:** {clean_guideline}\n\n"
        
        # Sanitização Rigorosa PhD: Remove pontos finais para MD026
        issue_clean = str(item.get('issue', '')).rstrip('.').strip()
        line = item.get('line', 'N/A')
        # UID sem dots nos identificadores técnicos
        file_id = str(item.get('file', '')).replace('.', '_').replace('\\', '/')
        uid = f"{file_id}_{line}"
        
        res = f"#### 🔴 Item {line}: {issue_clean} [ID: {uid}]\n\n"
        if item.get('snippet'):
            res += f"- **Evidência:**\n\n```kotlin\n{item.get('snippet').strip()}\n```\n\n"
        return res + f"- **Diretriz:** Padrão soberano de {sev.lower()}\n\n"
