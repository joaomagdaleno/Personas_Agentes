import time
import logging

logger = logging.getLogger(__name__)

class ReportFormatter:
    """Assistente Técnico: Especialista em Formatação de Relatórios PhD ✍️"""
    
    def __init__(self):
        from src.agents.Support.battle_plan_formatter import BattlePlanFormatter
        self.battle_plan_formatter = BattlePlanFormatter()

    def format_header(self, health_data):
        logger.info(f"✍️ [Formatter] Gerando cabeçalho de missão para {health_data['objective']}")
        status = '✅ ESTABILIDADE SOBERANA' if health_data['health_score'] >= 70 else '🚨 EMERGÊNCIA ESTRUTURAL'
        
        # Injeção de Identidade Operacional (Snippets do Arquiteto)
        op_status = "| Fase | Status | Info |\n| :--- | :--- | :--- |\n"
        op_status += f"| **Identidade** | SEED_IDENTITY | Ativa |\n"
        op_status += f"| **Memória** | MEMORY_UPLOAD | Sincronizada |\n"
        op_status += f"| **Treinamento** | TRAINING | Em curso |\n\n"

        return f"# 🏛️ MAPA DE CONSCIÊNCIA SISTÊMICA: {health_data['objective']}\n" \
               f"> **Visão Holística do Arquiteto PhD**\n\n" \
               f"**STATUS:** {status}\n" \
               f"**SINCRONIA:** {time.strftime('%Y-%m-%d %H:%M:%S')} | **ÍNDICE DE SAÚDE:** {health_data['health_score']}%\n" \
               f"---\n" \
               f"## 🧬 SINCRONIA DE IDENTIDADE\n{op_status}"

    def format_vitals(self, health_data):
        logger.debug("🩺 [Formatter] Consolidando sinais vitais...")
        blind, brittle = len(health_data['blind_spots']), len(health_data['brittle_points'])
        return f"## 🩺 SINAIS VITAIS DO PRODUTO\n" \
               f"| Métrica | Status | Impacto |\n| :--- | :--- | :--- |\n" \
               f"| **Pontos Cegos** | {blind} | {'Baixo' if blind < 2 else 'Crítico'} |\n" \
               f"| **Fragilidades** | {brittle} | {'Seguro' if brittle < 3 else 'Risco de Colapso'} |\n" \
               f"| **Paridade de Stack** | {len(health_data['parity'].get('gaps', []))} Gaps | Interoperabilidade |\n\n"

    def format_entropy(self, health_data):
        logger.debug("🌪️ [Formatter] Mapeando mapa de entropia...")
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
        for item in matrix:
            icon = "🟢 PROFUNDO" if item["test_status"] == "DEEP" else "🔴 FRÁGIL"
            res += f"| `{item['file']}` | {item['complexity']} | {item.get('assertions', 0)} | {icon} |\n"
        return res + "\n"

    def format_battle_plan(self, audit_results):
        """Delega a formatação densa para o BattlePlanFormatter."""
        return self.battle_plan_formatter.format(audit_results)
