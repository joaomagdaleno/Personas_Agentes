"""
🏛️ Sentinela do Sistema Soberano.
Analisa a performance global do computador e sugere otimizações reais.
"""
import psutil
import logging
import platform
import os
import ctypes
from datetime import datetime

logger = logging.getLogger(__name__)

class SystemSentinel:
    def __init__(self):
        self.is_admin = self._check_admin()
        
    def _check_admin(self):
        try:
            return ctypes.windll.shell32.IsUserAnAdmin() != 0
        except:
            return False

    def get_system_health(self):
        """Coleta métricas reais do hardware e sistema operacional."""
        cpu_load = psutil.cpu_percent(interval=1)
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Identifica processos "vilões" (gastando muita CPU ou RAM)
        bad_processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            try:
                if proc.info['cpu_percent'] > 50 or proc.info['memory_percent'] > 20:
                    bad_processes.append(proc.info)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue

        return {
            "cpu_usage": cpu_load,
            "memory_usage": mem.percent,
            "disk_free_gb": disk.free / (1024**3),
            "bad_processes": bad_processes,
            "is_admin": self.is_admin,
            "os": platform.platform()
        }

    def suggest_optimizations(self, health_data):
        """Gera sugestões baseadas nos dados coletados."""
        suggestions = []
        if health_data["cpu_usage"] > 80:
            suggestions.append("⚠️ Carga de CPU crítica. Considere fechar processos em segundo plano.")
        
        if health_data["memory_usage"] > 90:
            suggestions.append("⚠️ Memória RAM quase esgotada. Possível vazamento de memória detectado.")
            
        for proc in health_data["bad_processes"]:
            suggestions.append(f"🔥 Processo pesado detectado: {proc['name']} (PID: {proc['pid']})")

        if not self.is_admin:
            suggestions.append("🛡️ Executar como Administrador permitiria limpar caches de sistema e otimizar o registro.")
            
        return suggestions

    def analyze_and_kill_bloatware(self, cognitive_engine, history_agent):
        """
        🕵️‍♂️ Juízo Final: Analisa processos pesados e decide se devem morrer.
        Usa Gramática GBNF para garantir segurança absoluta na resposta da IA.
        """
        if not self.is_admin:
            logger.warning("🛡️ [Sentinel] Sem privilégios de Admin para gerenciar processos.")
            return

        whitelist = ["explorer.exe", "svchost.exe", "csrss.exe", "winlogon.exe", 
                     "services.exe", "lsass.exe", "System", "Registry", "smss.exe",
                     "python.exe", "py.exe", "cmd.exe", "powershell.exe", "samsunginternet.exe"]

        my_pid = os.getpid()
        
        # Gramática GBNF para JSON estrito
        # Força o modelo a responder APENAS {"action": "KILL"|"KEEP", "reason": "string"}
        decision_grammar = r'''
            root   ::= object
            object ::= "{" space "\"action\"" space ":" space action "," space "\"reason\"" space ":" space string "}" space
            action ::= "\"KILL\"" | "\"KEEP\""
            string ::= "\"" ([^"]*) "\""
            space  ::= [ \t\n]*
        '''

        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'username']):
            try:
                # Ignora a si mesmo e processos do sistema base
                if proc.info['pid'] == my_pid or proc.info['pid'] == 0: continue
                if proc.info['name'] in whitelist: continue
                
                # Critério: Consumindo > 10% CPU ou > 200MB RAM enquanto ocioso
                mem_mb = proc.info['memory_percent'] * (psutil.virtual_memory().total / (1024**2)) / 100
                if proc.info['cpu_percent'] < 5 and mem_mb < 200: continue

                # 🧠 Pergunta para a IA com Gramática
                prompt = f"""
                Analise o processo: {proc.info['name']} (RAM: {int(mem_mb)}MB).
                Contexto: PC Ocioso. Objetivo: Liberar recursos.
                Se for Jogo/Launcher/Bloatware -> KILL.
                Se for Driver/System/App Importante -> KEEP.
                Responda em JSON.
                """
                
                import json
                response_str = cognitive_engine.reason(prompt, max_tokens=64, grammar=decision_grammar, temperature=0.1)
                
                if response_str:
                    try:
                        decision = json.loads(response_str)
                        if decision.get("action") == "KILL":
                            p = psutil.Process(proc.info['pid'])
                            p.terminate()
                            msg = f"🔪 Processo encerrado: {proc.info['name']} ({int(mem_mb)}MB). Motivo: {decision.get('reason')}"
                            logger.info(msg)
                            history_agent.record_insight("KILL", msg, impact="HIGH")
                        else:
                            logger.info(f"🛡️ [Sentinel] Poupado: {proc.info['name']}. Motivo: {decision.get('reason')}")
                    except json.JSONDecodeError:
                        logger.error(f"❌ Erro ao decodificar decisão da IA: {response_str}")

            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
            except Exception as e:
                logger.error(f"Erro ao julgar processo {proc.info.get('name')}: {e}")
