from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class VoyagerPersona(BaseActivePersona):
    """Core: PhD in Technology Modernization 🚀"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Voyager", "🚀", "PhD Innovation Lead", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Evolução Tecnológica...")
        
        audit_rules = [
            {'regex': r"os\.path", 'issue': 'Obsolescência: Use pathlib.', 'severity': 'low'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "os.path" in content:
            return f"Débito Tecnológico: O objetivo '{objective}' exige modernidade. Em '{file}', o uso de APIs legadas retarda a 'Orquestração de Inteligência Artificial'."
        return None

    def perform_active_healing(self, blind_spots: list):
        """
        Cura Física Determinística: Reescreve arquivos para remover silenciamentos.
        """
        import re
        healed_count = 0
        
        for spot in blind_spots:
            try:
                path = self.project_root / spot
                if not path.exists(): continue
                
                content = path.read_text(encoding='utf-8')
                
                # Substitui o 'pass' por um log de erro limpo e técnico.
                # Regex aprimorado para capturar a indentação original e garantir sintaxe válida.
                lines = content.splitlines()
                new_lines = []
                changed = False
                
                for line in lines:
                    # Caso: Bloco except que termina com pass
                    # Funciona para 'except:', 'except Exception:', 'except (Error1, Error2):' etc.
                    if "except" in line and ":" in line:
                        new_lines.append(line)
                        # Verifica se a próxima linha útil é um 'pass'
                        continue
                    
                    if line.strip() == "pass" and len(new_lines) > 0 and "except" in new_lines[-1]:
                        indent = line.split("pass")[0]
                        safe_spot = str(spot).replace("\\", "/")
                        log_msg = f"logger.error(f'🚨 FALHA CRÍTICA SILENCIADA em {safe_spot}', exc_info=True)"
                        new_lines.append(f"{indent}{log_msg}")
                        changed = True
                        continue

                    new_lines.append(line)
                
                if changed:
                    path.write_text("\n".join(new_lines), encoding='utf-8')
                    logger.info(f"✨ [Voyager] Arquivo '{spot}' foi curado fisicamente.")
                    healed_count += 1
            except Exception as e:
                logger.error(f"❌ Falha ao curar {spot}: {e}")
        
        return healed_count

    def suggest_auto_healing(self, blind_spots: list):
        """
        Auto-Cura: Sugere correções para erros silenciados.
        """
        suggestions = []
        for spot in blind_spots:
            suggestions.append(f"Cura sugerida para {spot}: Substituir 'except: pass' por log detalhado de erro.")
        return suggestions

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em inovação."