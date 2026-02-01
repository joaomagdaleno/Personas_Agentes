import time

class ReportFormatter:
    """Assistente Técnico: Especialista em Formatação de Relatórios PhD ✍️"""
    
    def format_header(self, health_data):
        status = '✅ ESTABILIDADE SOBERANA' if health_data['health_score'] >= 70 else '🚨 EMERGÊNCIA ESTRUTURAL'
        return f"# 🏛️ MAPA DE CONSCIÊNCIA SISTÊMICA: {health_data['objective']}\n" \
               f"> **Visão Holística do Arquiteto PhD**\n\n" \
               f"**STATUS:** {status}\n" \
               f"**SINCRONIA:** {time.strftime('%Y-%m-%d %H:%M:%S')} | **ÍNDICE DE SAÚDE:** {health_data['health_score']}%\n---\n"

    def format_vitals(self, health_data):
        blind, brittle = len(health_data['blind_spots']), len(health_data['brittle_points'])
        return f"## 🩺 SINAIS VITAIS DO PRODUTO\n" \
               f"| Métrica | Status | Impacto |\n| :--- | :--- | :--- |\n" \
               f"| **Pontos Cegos** | {blind} | {'Baixo' if blind < 2 else 'Crítico'} |\n" \
               f"| **Fragilidades** | {brittle} | {'Seguro' if brittle < 3 else 'Risco de Colapso'} |\n" \
               f"| **Paridade de Stack** | {len(health_data['parity'].get('gaps', []))} Gaps | Interoperabilidade |\n\n"

    def format_entropy(self, health_data):
        map_data = health_data.get("map", {})
        top = sorted([{"f": f, "c": i.get("complexity", 0), "cp": i.get("coupling", {}).get("instability", 0)} 
                     for f, i in map_data.items() if i.get("complexity")], key=lambda x: x["c"], reverse=True)[:5]
        
        res = "## 🌪️ MAPA DE ENTROPIA & ACOPLAMENTO\n| Alvo | Complexidade | Instabilidade |\n| :--- | :---: | :---: |\n"
        for item in top: res += f"| `{item['f']}` | {item['c']} | {round(item['cp'], 2)} |\n"
        return res + "\n"

    def format_efficiency(self, health_data):
        eff = health_data.get("efficiency", {})
        if not eff: return ""
        return f"## ⚡ EFICIÊNCIA OPERACIONAL\n| Indicador | Valor | Impacto |\n| :--- | :--- | :--- |\n" \
               f"| **Economia de I/O** | {eff.get('saved_io', 0)}% | **{eff.get('efficiency_label', 'ALTA')}** |\n\n"

    def format_quality_matrix(self, health_data):
        matrix = health_data.get("test_quality_matrix", [])
        res = "## 🧪 MATRIZ DE CONFIANÇA\n| Módulo | Entropia | Asserções | Status |\n| :--- | :---: | :---: | :--- |\n"
        for item in matrix[:5]:
            icon = "🟢 PROFUNDO" if item["test_status"] == "DEEP" else "🔴 FRÁGIL"
            res += f"| `{item['file']}` | {item['complexity']} | {item.get('assertions', 0)} | {icon} |\n"
        return res + "\n"

    def format_battle_plan(self, audit_results):
        active = [i for i in audit_results if not isinstance(i, dict) or i.get('severity') != 'HEALED']
        res = "## 🎯 PLANO DE BATALHA: DIRETRIZES DE ENGENHARIA\n"
        res += "> Este seção contém instruções atômicas para correção automatizada.\n\n"
        
        for i, item in enumerate(active, 1):
            if isinstance(item, dict):
                res += f"### {i}. [{item.get('severity', 'MEDIUM')}] @ `{item.get('file')}`\n"
                res += f"- **Problema:** {item.get('issue')}\n"
                res += f"- **Localização:** Linha {item.get('line', 'N/A')}\n"
                if item.get('snippet'):
                    res += f"- **Evidência:**\n```kotlin\n{item.get('snippet')}\n```\n"
                res += f"- **Racional PhD:** A presença deste padrão compromete a soberania técnica e a manutenibilidade do ecossistema.\n"
                res += f"- **Diretriz de Cura:** Substituir o trecho acima por uma implementação que siga os padrões de segurança SSL, injeção de dependência e logs estruturados.\n\n"
            else:
                res += f"### {i}. [STRATEGIC] @ `DNA`\n- **Diretriz:** {item}\n\n"
        return res
