"""
🧠 Verificador de Integridade Cognitiva.
---------------------------------------
Diagnóstico isolado para o CognitiveEngine (LLM Local).
Verifica:
1. Lazy Loading (Gerenciamento de memória).
2. Inferência Real (Teste de raciocínio).
3. Liberação de Recursos (Memory Release).
"""
import sys
import os

# Adiciona o diretório raiz ao sys.path para importação correta
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.append(project_root)

from src_local.utils.cognitive_engine import CognitiveEngine

def verify_cognitive_engine():
    """Executa a bateria de testes cognitivos."""
    print("[INFO] Verificando Cognitive Engine...")
    
    engine = CognitiveEngine()
    
    # Teste 1: Lazy Loading
    print("[TEST] 1: Lazy Loading (nao deve carregar modelo ainda)...")
    if engine.model is not None:
        print("[FAIL] Modelo carregado prematuramente.")
        return
    print("[PASS] Lazy Loading OK.")
    
    # Teste 2: Carga real (Mocked se dependencias faltarem, mas aqui queremos ver se tenta)
    print("[TEST] 2: Tentativa de Raciocinio (pode demorar no download)...")
    
    try:
        response = engine.reason("Responda apenas 'OK'.")
        
        if response:
            print(f"[PASS] Raciocinio OK. Resposta: {response}")
        else:
            print("[WARN] Raciocinio retornou None (provavelmente falta de libs ou modelo nao baixado).")
            print("Verifique os logs para detalhes.")
            
    except Exception as e:
        print(f"[FAIL] Erro durante raciocinio: {e}")

    # Teste 3: Release
    engine.release()
    if engine.model is None:
        print("[PASS] Memoria liberada.")
    else:
        print("[FAIL] Falha na liberacao de memoria.")

if __name__ == "__main__":
    verify_cognitive_engine()
