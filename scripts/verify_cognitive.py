"""
🧠 Verificador de Sanidade Cognitiva PhD.
Valida se o SLM (Small Language Model) está carregando e respondendo corretamente.
"""
import sys
import os
import logging

# Adiciona o diretório raiz ao sys.path para importação correta
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.append(project_root)

from src_local.utils.cognitive_engine import CognitiveEngine

logger = logging.getLogger(__name__)

def verify_cognitive_engine():
    """Executa a bateria de testes cognitivos soberanos."""
    logger.info("🧠 [Verify] Verificando Cognitive Engine...")
    
    engine = CognitiveEngine()
    
    # Teste 1: Lazy Loading
    if engine.model is not None:
        logger.error("❌ [Verify] Modelo carregado prematuramente.")
        return
    logger.info("✅ [Verify] Lazy Loading OK.")
    
    # Teste 2: Carga real
    try:
        response = engine.reason("Responda apenas 'OK'.")
        if response:
            logger.info(f"✅ [Verify] Raciocínio OK. Resposta: {response}")
        else:
            logger.warning("⚠️ [Verify] Raciocínio retornou vazio.")
    except Exception as e:
        logger.error(f"❌ [Verify] Erro no raciocínio: {e}")

    # Teste 3: Release
    engine.release()
    if engine.model is None:
        logger.info("✅ [Verify] Memória liberada.")
    else:
        logger.error("❌ [Verify] Falha na liberação.")

if __name__ == "__main__":
    verify_cognitive_engine()
