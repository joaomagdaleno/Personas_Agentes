import logging
import time
from pathlib import Path
from src_local.agents.base import BaseActivePersona
from src_local.utils.cognitive_engine import CognitiveEngine

logger = logging.getLogger(__name__)

class HealerPersona(BaseActivePersona):
    """
    🩹 Agente Healer (PhD in Software Reparation).
    Usa o CognitiveEngine para gerar patches de correção e validar a cura.
    """
    
    def __init__(self, project_root=None):
        super().__init__(project_root)
        self.name = "Healer"
        self.role = "PhD Software Healer"
        self.emoji = "🩹"
        self.stack = "Correction"
        self.brain = CognitiveEngine()

    def perform_audit(self) -> list:
        # Healer não audita, ele repara sob demanda.
        return []

    def _reason_about_objective(self, objective, file, content):
        # Healer não participa de auditoria estratégica passiva.
        return None

    def heal_finding(self, finding: dict) -> bool:
        """Tenta curar uma fragilidade específica."""
        file_path = finding.get("file")
        issue = finding.get("issue")
        
        if not file_path or not issue:
            return False
            
        full_path = Path(self.project_root) / file_path
        if not full_path.exists():
            logger.error(f"🩹 [Healer] Arquivo não encontrado para cura: {file_path}")
            return False
            
        logger.info(f"🩹 [Healer] Iniciando protocolo de cura em: {file_path}")
        content = full_path.read_text(encoding="utf-8")
        
        prompt = f"""
        Você é o Dr. Healer, PhD em Reparação de Software.
        Analise a seguinte fragilidade e forneça o código CORRIGIDO.
        
        ARQUIVO: {file_path}
        CÓDIGO ATUAL:
        ```python
        {content}
        ```
        
        PROBLEMA: {issue}
        
        REQUISITO: Forneça APENAS o código completo corrigido, sem explicações, rodeado por triplos backticks.
        """
        
        suggestion = self.brain.reason(prompt)
        if not suggestion:
            return False
            
        # Extrai código do markdown
        import re
        match = re.search(r"```python\n(.*?)\n```", suggestion, re.DOTALL)
        if not match:
            # Tenta sem o 'python' tag
            match = re.search(r"```\n(.*?)\n```", suggestion, re.DOTALL)
            
        if match:
            new_content = match.group(1)
            # Backup
            backup_path = full_path.with_suffix(full_path.suffix + ".bak")
            full_path.rename(backup_path)
            
            try:
                full_path.write_text(new_content, encoding="utf-8")
                logger.info(f"✨ [Healer] Remendo aplicado em {file_path}. Validando...")
                
                # Validação imediata pós-cura
                from src_local.agents.Support.infrastructure_assembler import InfrastructureAssembler
                tools = InfrastructureAssembler.assemble_orchestrator_tools(self.project_root)
                res = tools["validator"].verify_core_health(self.project_root, changed_files=[file_path])
                
                if res.get("success"):
                    logger.info(f"✅ [Healer] Cura CONFIRMADA em {file_path}.")
                    if backup_path.exists(): backup_path.unlink()
                    return True
                else:
                    logger.warning(f"❌ [Healer] Cura REPROVADA. Revertendo {file_path}...")
                    backup_path.replace(full_path)
                    return False
            except Exception as e:
                logger.error(f"❌ [Healer] Falha fatal no processo: {e}")
                if backup_path.exists(): backup_path.replace(full_path)
                return False
        
        return False

    def get_system_prompt(self):
        return "Você é o Dr. Healer, focado em correções de código seguras e minimalistas."
