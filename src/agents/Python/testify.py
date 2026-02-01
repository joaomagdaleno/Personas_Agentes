from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class TestifyPersona(BaseActivePersona):
    """
    Core: PhD in Software Verification & Reliability Strategy 🧪
    Estrategista em Pirâmide de Testes (Unit/Integration/E2E) e testes avançados.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Testify", "🧪", "PhD QA Strategist", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Ecossistema de Confiabilidade...")
        
        # Regras para identificar diferentes níveis da pirâmide e tecnologias avançadas
        audit_rules = [
            {'regex': r"def test_.*:\s+pass", 'issue': 'Vazio: Teste sem asserções (Falsa Segurança).', 'severity': 'critical'},
            {'regex': r"mock\.", 'issue': 'Nível: Teste de Integração/Mock detectado.', 'severity': 'low'},
            {'regex': r"hypothesis", 'issue': 'Avançado: Teste de Propriedade detectado (Hypothesis).', 'severity': 'low'},
            {'regex': r"mutmut|mutant", 'issue': 'Avançado: Teste de Mutação detectado.', 'severity': 'low'},
            {'regex': r"pact|contract", 'issue': 'Arquitetura: Teste de Contrato detectado.', 'severity': 'low'}
        ]
        
        results = self.find_patterns(('.py', '.dart', '.kt'), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def run_test_suite(self):
        """
        Execução Empírica com Análise Forense de Falhas.
        """
        import subprocess
        import sys
        import re
        
        logger.info("🧪 [Testify] Iniciando execução e diagnóstico de falhas...")
        try:
            result = subprocess.run(
                [sys.executable, "-m", "unittest", "discover", "tests"],
                capture_output=True,
                text=True,
                cwd=self.project_root
            )
            
            output = result.stderr
            is_success = result.returncode == 0
            
            # 1. Parsing de Métricas Básicas
            tests_run = 0
            failures = 0
            run_match = re.search(r"Ran (\d+) tests", output)
            if run_match: tests_run = int(run_match.group(1))
            
            fail_match = re.search(r"FAILED \((?:failures|errors)=(\d+)\)", output)
            if fail_match: failures = int(fail_match.group(1))
            elif not is_success and tests_run > 0: failures = tests_run # Falha total de env
            
            # 2. Diagnóstico de Causa Raiz das Falhas
            failure_details = []
            # Procura por blocos de erro: FAIL ou ERROR
            error_blocks = re.split(r"={10,}", output)
            if len(error_blocks) > 1:
                for block in error_blocks[1:]:
                    if "Traceback" in block:
                        test_name_match = re.search(r"(?:FAIL|ERROR): (.*)", block)
                        test_name = test_name_match.group(1) if test_name_match else "Desconhecido"
                        
                        # Extrai a última linha do erro (a mensagem de erro real)
                        lines = [l for l in block.strip().splitlines() if l]
                        error_msg = lines[-1]
                        
                        # Motor de Sugestão de Resolução
                        resolution = "Investigar lógica interna do teste."
                        if "ModuleNotFoundError" in error_msg:
                            resolution = "Erro de Importação: Verifique se o diretório 'src' está no PYTHONPATH ou se há um __init__.py ausente."
                        elif "AssertionError" in error_msg:
                            resolution = "Falha de Lógica: O valor retornado não condiz com o esperado. Verifique a implementação da função alvo."
                        elif "FileNotFoundError" in error_msg:
                            resolution = "Caminho Inválido: O teste tentou acessar um arquivo que não existe ou o caminho relativo está incorreto."
                        elif "SyntaxError" in error_msg:
                            resolution = "Erro de Escrita: Corrija a sintaxe no arquivo mencionado no traceback."

                        failure_details.append({
                            "test": test_name,
                            "error": error_msg,
                            "resolution": resolution
                        })

            return {
                "success": is_success,
                "total_run": tests_run,
                "passed": tests_run - failures,
                "failed": failures,
                "pass_rate": round(((tests_run - failures) / tests_run * 100), 2) if tests_run > 0 else 0,
                "details": failure_details[:10] # Top 10 falhas para não poluir
            }
        except Exception as e:
            logger.error(f"❌ Falha crítica no executor de testes: {e}")
            return {"success": False, "error": str(e), "details": []}

    def analyze_test_pyramid(self):
        """
        Analisa a distribuição real dos testes no projeto para verificar conformidade com a meta (70/20/10).
        """
        import os
        map_data = self.context_data
        pyramid = {"unit": 0, "integration": 0, "e2e": 0, "total": 0}
        
        for file in map_data.keys():
            # Normaliza o caminho para detectar a pasta tests
            normalized_file = file.replace("\\", "/")
            if not ("tests/" in normalized_file or normalized_file.startswith("tests/")): continue
            
            content = self.read_project_file(file)
            if not content: continue
            
            pyramid["total"] += 1
            if "mock" in content or "requests_mock" in content or "DioAdapter" in content:
                pyramid["integration"] += 1
            elif "selenium" in content or "integration_test" in content or "Espresso" in content:
                pyramid["e2e"] += 1
            else:
                pyramid["unit"] += 1
        
        return pyramid

    def _reason_about_objective(self, objective, file, content):
        # Raciocínio inteligente sobre a necessidade de testes avançados
        if file.endswith('.py') and "class" in content and "def " in content:
            if "tests/" not in file:
                # Se o arquivo for crítico e não for um teste, sugere cobertura
                return f"Exposição de Risco: O objetivo '{objective}' exige confiança. O arquivo '{file}' contém lógica de negócio mas é Matéria Escura. Sugestão: Implementar Testes Unitários (70% da Pirâmide)."
        
        if "pass" in content and "test_" in file:
            return f"Ilusão de Cobertura: O teste '{file}' está silenciado com 'pass'. Isso invalida o objetivo '{objective}' pois cria uma falsa sensação de segurança."
            
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, estrategista de QA. Sua missão é garantir que o projeto siga a pirâmide de testes 70/20/10 e utilize técnicas de Mutação e Propriedade para atingir 100% de confiança."
