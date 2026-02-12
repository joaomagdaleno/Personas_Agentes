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
    
    def detect_test(self, file_path: Path, comp_type: str, all_files: list, f_info: dict = None) -> bool:
        """
        🕵️ Busca por um arquivo de teste correspondente no ecossistema.
        Utiliza busca semântica para validar se o componente possui verificação física.
        """
        comp_type = comp_type or "UNKNOWN"
        # Rigor Phd: Apenas arquivos puramente estruturais (complexidade 1) ou documentação são auto-verificados.
        # Se houver lógica ou ambiguidade (complexidade > 1), a soberania exige evidência física de teste.
        is_boilerplate = f_info.get("complexity", 1) <= 1 if f_info else True
        
        if comp_type == "DOC": return True
        if comp_type in ["CONFIG", "PACKAGE_MARKER", "UTIL"] and is_boilerplate: return True
        if comp_type == "TEST": return True
        
        name_stem = file_path.stem.lower()
        
        # Rigor PhD: Busca Semântica
        # Verifica se o radical do arquivo existe em qualquer arquivo que comece com 'test_'
        for f_name in all_files:
            if f_name.lower().startswith("test_") and name_stem in f_name.lower():
                logger.debug(f"Test match found: {f_name}")
                return True
                
        return False
