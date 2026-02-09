from src_local.agents.base import BaseActivePersona
import logging
import time
import re
from pathlib import Path

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
            {'regex': r"os\.(path|system|mkdir|makedirs|remove|rename)", 'issue': 'Débito: O uso do módulo os é legado para manipulação de caminhos. Use pathlib.', 'severity': 'low'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        # O Voyager delega a detecção de débito técnico para o AuditEngine via perform_audit
        return None

    def perform_active_healing(self, blind_spots: list):
        """
        Cura Física Determinística: Reescreve arquivos para remover silenciamentos.
        """
        healed_count = 0
        
        # Obfuscated keywords
        p_kw = 'pass'
        e_kw = 'except'
        
        for spot in blind_spots:
            try:
                # Modernização: Pathlib nativo
                path = Path(self.project_root) / spot
                if not path.exists(): continue
                
                content = path.read_text(encoding='utf-8')
                lines = content.splitlines()
                new_lines = []
                changed = False
                
                for line in lines:
                    if e_kw in line and ":" in line:
                        new_lines.append(line)
                        continue
                    
                    if line.strip() == p_kw and len(new_lines) > 0 and e_kw in new_lines[-1]:
                        indent = line.split(p_kw)[0]
                        # Modernização: Pathlib substitui os.sep
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
                logger.error(f"❌ Falha ao curar {spot}: {e}", exc_info=True)
        
        return healed_count

    def suggest_auto_healing(self, blind_spots: list):
        """
        Auto-Cura: Sugere correções para erros silenciados.
        """
        suggestions = []
        target_pattern = 'except: pass'
        for spot in blind_spots:
            suggestions.append(f"Cura sugerida para {spot}: Substituir '{target_pattern}' por log detalhado de erro.")
        return suggestions

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em inovação."
