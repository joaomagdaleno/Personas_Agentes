import json
import re
import logging

logger = logging.getLogger(__name__)

class CognitiveAnalyst:
    """Assistente cognitivo para análise de intenção e discrepâncias."""
    
    @staticmethod
    def analyze_intent(filename, docstring, content, brain):
        prompt = CognitiveAnalyst._build_prompt(filename, docstring, content)
        try:
            res = brain.reason(prompt)
            if not res: return None
            
            match = re.search(r"\{.*\}", res, re.DOTALL)
            if not match: 
                logger.warning(f"⚠️ Resposta da IA para {filename} não contém JSON válido.")
                return None
            
            data = json.loads(match.group(0))
            if not data.get("consistent", True):
                return {
                    "file": filename, "line": 1, "severity": data.get("severity", "MEDIUM"),
                    "issue": f"Desvio de Intenção: {data.get('issue')}", "context": "CognitiveIntent"
                }
        except Exception as e:
            logger.error(f"❌ Falha na análise cognitiva de {filename}: {e}")
        return None

    @staticmethod
    def _build_prompt(filename, doc, code):
        return f"""Audite se o código abaixo cumpre sua docstring.
ARQUIVO: {filename}
DOCSTRING: "{doc}"
CÓDIGO (Resumo): {code[:2000]}
RESPONDA EM JSON: {{"consistent": true/false, "issue": "...", "severity": "..."}}
"""
