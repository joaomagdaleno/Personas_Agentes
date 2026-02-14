import re
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class SecuritySentinelAgent:
    """Agente especialista em detecção de vazamento de segredos e vulnerabilidades externas."""
    
    def __init__(self):
        # Padrões comuns de segredos corrigidos
        self.secret_patterns = {
            "OpenAI API Key": r"sk-[a-zA-Z0-9]{48}",
            "Generic Secret": r"(?i)(password|secret|passwd|api_key|token)\s*[:=]\s*['\"][^'\"]+['\"]",
            "AWS Access Key": r"AKIA[0-9A-Z]{16}"
        }

    def scan_project(self, project_root, context_map):
        """Varre o projeto em busca de riscos de segurança."""
        import time
        from src_local.utils.logging_config import log_performance
        start_t = time.time()
        
        logger.info("🛡️ [Security] Iniciando varredura de segredos e dependências...")
        findings = []
        
        for rel_path, data in context_map.items():
            content = data.get("content", "")
            if content:
                findings.extend(self._scan_content(rel_path, content))
        
        log_performance(logger, start_t, "🛡️ [Security] Full project scan")
        return findings

    def _scan_content(self, file_path, content):
        hits = []
        for name, pattern in self.secret_patterns.items():
            if re.search(pattern, content):
                hits.append({
                    "file": file_path,
                    "severity": "CRITICAL",
                    "issue": f"Segredo Exposto: {name}",
                    "context": "SecuritySentinel"
                })
        return hits
