"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Motor de Seções do Plano de Batalha (BattlePlanSectionsEngine)
Função: Formatar grupos de severidade e itens individuais.
"""

import logging
logger = logging.getLogger(__name__)

class BattlePlanSectionsEngine:
    def format_severity_group(self, sev, items, item_formatter):
        import time
        start_time = time.time()
        
        res = f"## 🚩 NÍVEL: {sev}\n\n"
        file_groups = {}
        for item in items:
            fname = item.get('file', 'Global') if isinstance(item, dict) else "Sistêmico"
            if fname not in file_groups: file_groups[fname] = []
            file_groups[fname].append(item)

        for fname, group in file_groups.items():
            res += f"### 📂 Alvo: `{fname}` [{sev}]\n\n"
            for item in group: res += item_formatter(item, sev)
            
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_time, f"Telemetry: Formatting {sev} group")
        return res.strip()

    def format_item_entry(self, item, sev):
        if not isinstance(item, dict):
            return f"- **Diretriz Estratégica:** {str(item).rstrip('.').strip()}\n\n"
        
        issue_clean = str(item.get('issue', '')).rstrip('.').strip()
        line = item.get('line', 'N/A')
        file_id = str(item.get('file', '')).replace('.', '_').replace('\\', '/')
        
        res = f"#### 🔴 Item {line}: {issue_clean} [ID: {file_id}_{line}]\n\n"
        if item.get('snippet'):
            res += f"- **Evidência:**\n\n```kotlin\n{item.get('snippet').strip()}\n```\n\n"
        return res + f"- **Diretriz:** Padrão soberano de {sev.lower()}\n\n"

    def filter_active_results(self, audit_results, key_gen):
        dedup, seen = [], set()
        for i in audit_results:
            key = key_gen(i)
            if key not in seen:
                dedup.append(i)
                seen.add(key)
        return [i for i in dedup if not isinstance(i, dict) or i.get('severity') != 'HEALED']
