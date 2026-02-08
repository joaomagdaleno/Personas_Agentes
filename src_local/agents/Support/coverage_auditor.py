"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Auditor de Cobertura (CoverageAuditor)
Função: Especialista em correlacionar arquivos de produção com seus testes.
"""
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class CoverageAuditor:
    """
    📐 Auditor de Cobertura PhD.
    O inspetor de integridade que busca evidências físicas de testes unitários
    para cada componente de produção, combatendo a "Matéria Escura" no código.
    """
    
    def detect_test(self, file_path: Path, comp_type: str, all_files: list) -> bool:
        """
        🕵️ Busca por um arquivo de teste correspondente no ecossistema.
        Utiliza busca semântica para validar se o componente possui verificação física.
        """
        logger.debug(f"Detecting test for: {file_path.name} ({comp_type})")
        # Apenas arquivos que são inerentemente de teste ou config estão isentos
        if comp_type in ["TEST", "CONFIG", "DOC"]: return True
        if "__init__.py" in file_path.name: return True
        
        name_stem = file_path.stem.lower()
        
        # Rigor PhD: Busca Semântica
        # Verifica se o radical do arquivo existe em qualquer arquivo que comece com 'test_'
        for f_name in all_files:
            if f_name.lower().startswith("test_") and name_stem in f_name.lower():
                logger.debug(f"Test match found: {f_name}")
                return True
                
        return False
