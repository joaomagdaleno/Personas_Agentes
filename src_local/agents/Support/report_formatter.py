import time
import logging

logger = logging.getLogger(__name__)

class ReportFormatter:
    """
    ✍️ Formatador de Relatórios PhD.
    O Escriba Soberano que traduz dados técnicos em mapas de consciência sistêmica,
    garantindo que o débito técnico e a saúde sejam visíveis e honestos.
    """
    
    def __init__(self):
        from src_local.agents.Support.battle_plan_formatter import BattlePlanFormatter
        self.battle_plan_formatter = BattlePlanFormatter()

    def format_header(self, health_data):
        """
        🧬 Gera o cabeçalho de missão com índice de saúde e status de sincronia.
        Define o tom do relatório baseado no score soberano.
        """
        logger.info(f"✍️ [Formatter] Gerando cabeçalho de missão para {health_data['objective']}")
        
        score = health_data['health_score']
        # Status baseados na escala de maturidade PhD 3.0
        if score == 100: status = '💎 PERFEIÇÃO TÉCNICA (Soberania)'
        elif score >= 90: status = '✅ ESTABILIDADE ELEVADA'
        elif score >= 70: status = '⚠️ ALERTA: DÉBITO TÉCNICO'
        elif score > 0: status = '🚨 EMERGÊNCIA ESTRUTURAL'
        else: status = '💀 COLAPSO DE INTEGRIDADE'
        
        # Injeção de Identidade Operacional (Snippets do Arquiteto)
        op_status = "| Métrica | Valor | Status |\n| :--- | :--- | :--- |\n"
        op_status += f"| **Índice de Saúde** | {score}% | {status.split()[0]} |\n"
        op_status += f"| **Total de Alertas** | {health_data.get('total_issues', 0)} | {'Crítico' if health_data.get('total_issues', 0) > 50 else 'Monitorado'} |\n"
        op_status += f"| **Sincronia** | {time.strftime('%H:%M:%S')} | Ativa |\n\n"

        objective_clean = health_data['objective'].rstrip('.')
        return (f"# 🏛️ MAPA DE CONSCIÊNCIA SISTÊMICA: {objective_clean}\n\n"
                f"> **Visão Holística do Arquiteto PhD (Token: FBI_SINC_FINAL)**\n\n"
                f"{status}\n\n"
                f"---\n\n"
                f"## 🧬 SINCRONIA DE IDENTIDADE\n\n{op_status.strip()}").strip()

    def format_vitals(self, health_data):
        """
        🩺 Consolida os sinais vitais do produto.
        Mapeia Pontos Cegos (vácuo de testes), Fragilidades (erros silenciados) 
        e paridade de infraestrutura.
        """
        logger.debug("🩺 [Formatter] Consolidando sinais vitais...")
        
        # Rigor Máximo: Lê 'dark_matter' diretamente do sintetizador
        blind_files = health_data.get('dark_matter', [])
        blind_count = len(blind_files)
        brittle_count = len(health_data.get('brittle_points', []))
        score = health_data['health_score']
        
        # Rigor Externo vs Interno
        if health_data.get("is_external"):
            infra_label = "**Arquitetura PhD**"
            infra_status = "Em conformidade" if score > 85 else "Débito Estrutural"
        else:
            parity_gaps = len(health_data['parity'].get('gaps', []))
            infra_label = "**Paridade de Stack**"
            infra_status = "Sincronizada" if parity_gaps == 0 else f"{parity_gaps} Gaps"

        return (f"## 🩺 SINAIS VITAIS DO PRODUTO\n\n"
                f"| Métrica | Status | Impacto |\n| :--- | :--- | :--- |\n"
                f"| **Pontos Cegos** | {blind_count} Arquivos | {'Seguro' if blind_count == 0 else ('Alerta' if blind_count < 10 else 'CRÍTICO')} |\n"
                f"| **Fragilidades** | {brittle_count} Pontos | {'Seguro' if brittle_count == 0 else 'Risco de Colapso'} |\n"
                f"| {infra_label} | {infra_status} | Nível de Maturidade |").strip()

    def format_entropy(self, health_data):
        logger.debug("🌪️ [Formatter] Mapeando mapa de entropia...")
        map_data = health_data.get("map", {})
        
        # Tenta pegar complexidade de QUALQUER arquivo que tenha dados
        top = []
        for f, i in map_data.items():
            complexity = i.get("complexity", 1) # Default 1 para arquivos mapeados
            instability = i.get("coupling", {}).get("instability", 0)
            top.append({"f": f, "c": complexity, "cp": instability})
            
        top = sorted(top, key=lambda x: x["c"], reverse=True)[:10]
        
        res = "## 🌪️ MAPA DE ENTROPIA & ACOPLAMENTO\n\n| Alvo | Complexidade | Instabilidade |\n| :--- | :---: | :---: |\n"
        for item in top: res += f"| `{item['f']}` | {item['c']} | {round(item['cp'], 2)} |\n"
        return res.strip()

    def format_efficiency(self, health_data):
        eff = health_data.get("efficiency", {})
        if not eff: return ""
        return (f"## ⚡ EFICIÊNCIA OPERACIONAL\n\n"
                f"| Indicador | Valor | Impacto |\n| :--- | :--- | :--- |\n"
                f"| **Economia de I/O** | {eff.get('saved_io', 0)}% | **{eff.get('efficiency_label', 'ALTA')}** |").strip()

    def format_quality_matrix(self, health_data):
        matrix = health_data.get("test_quality_matrix", [])
        res = "## 🧪 MATRIZ DE CONFIANÇA\n\n| Módulo | Entropia | Asserções | Status |\n| :--- | :---: | :---: | :--- |\n"
        for item in matrix:
            icon = "🟢 PROFUNDO" if item["test_status"] == "DEEP" else "🔴 FRÁGIL"
            res += f"| `{item['file']}` | {item['complexity']} | {item.get('assertions', 0)} | {icon} |\n"
        return res.strip()

    def format_battle_plan(self, audit_results):
        """Delega a formatação densa para o BattlePlanFormatter."""
        return self.battle_plan_formatter.format(audit_results)

    def format_obfuscation_zone(self, findings):
        """
        🕵️ Zona de Higiene de Código.
        Destaca tentativas de ocultação de lógica.
        """
        res = "## 🕵️ CODEX OBSCURUS: Análise de Ofuscação\n\n"
        res += "> **Política de Código Limpo:** Lógica oculta é lógica suspeita. A 'Orquestração' exige transparência.\n\n"
        
        for f in findings:
            # Títulos sanitizados para MD024/MD026
            file_clean = str(f['file']).replace('.', '_').replace('\\', '/')
            res += f"### 🎭 {f['file']}:{f['line']} [ID: obf_{file_clean}_{f['line']}]\n\n"
            res += f"- **Detecção:** {f['issue'].rstrip('.')}\n"
            if 'snippet' in f:
                res += f"- **Evidência:** `{f['snippet'].strip()}`\n\n"
        
        res += "---\n"
        return res.strip()
