"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Auditor de Cobertura (CoverageAuditor)
Função: Especialista em correlacionar arquivos de produção com seus testes.
"""
class CoverageAuditor:
    """Assistente Técnico: Especialista em Verificação de Cobertura 🧪"""

    def detect_test(self, path, component_type, all_files_index):
        """Verifica se um arquivo de produção possui um teste correspondente."""
        if ("src" not in str(path) and "app" not in str(path)) or component_type == "TEST":
            return True # Não elegível ou já é um teste
            
        stem = path.stem.lower()
        return any((f"test_{stem}" in f) or (f"{stem}test" in f) for f in all_files_index)
