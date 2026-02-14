import logging
import os
from pathlib import Path
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class CognitiveEngine:
    """
    🧠 Cérebro Local (Built-in SLM).
    Gerencia o ciclo de vida do modelo de linguagem local (Small Language Model).
    """
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CognitiveEngine, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized: return
        
        self.model = None
        self.model_path = None
        self.context_window = 2048
        self._initialized = True
        self.model_name = "Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF"
        self.model_file = "qwen2.5-coder-1.5b-instruct-q4_k_m.gguf"

    def load_model(self) -> bool:
        """Carrega o modelo na memória (Lazy Loading)."""
        if self.model: return True
        
        try:
            from huggingface_hub import hf_hub_download
            from llama_cpp import Llama
            
            logger.info(f"🧠 Inicializando Cognitive Engine ({self.model_name})...")
            
            # Download/Cache do modelo
            self.model_path = hf_hub_download(
                repo_id=self.model_name,
                filename=self.model_file
            )
            
            # Inicialização do Llama
            self.model = Llama(
                model_path=self.model_path,
                n_ctx=self.context_window,
                n_threads=os.cpu_count() - 2, # Deixa 2 cores livres
                verbose=False
            )
            
            logger.info("🧠 Cérebro online.")
            return True
            
        except ImportError:
            logger.warning("⚠️ Dependências de IA não encontradas (llama-cpp-python). Modo cognitivo desativado.")
            return False
        except Exception as e:
            logger.error(f"❌ Falha ao carregar cérebro: {e}")
            return False

    def reason(self, prompt: str, max_tokens: int = 512, memory: Any = None) -> Optional[str]:
        """Processa um pensamento com suporte a RAG (Contexto do Projeto)."""
        if not self.load_model(): return None
        
        # 🧠 RAG: Injeta contexto do projeto se o motor de memória estiver disponível
        rag_context = ""
        if memory:
            rag_context = memory.search_context(prompt)
            if rag_context:
                logger.info("🧠 [RAG] Contexto injetado no pensamento.")

        try:
            # Formato ChatML Padrão
            system_msg = "Você é uma IA assistente técnica especializada em Python e orquestração de agentes."
            if rag_context:
                system_msg += f"\n\n{rag_context}"
                
            formatted_prompt = f"<|im_start|>system\n{system_msg}<|im_end|>\n<|im_start|>user\n{prompt}<|im_end|>\n<|im_start|>assistant\n"
            
            output = self.model(
                formatted_prompt,
                max_tokens=max_tokens,
                stop=["<|im_end|>", "<|endoftext|>"],
                echo=False
            )
            
            return output['choices'][0]['text'].strip()
            
        except Exception as e:
            logger.error(f"❌ Falha no raciocínio: {e}")
            return None

    def release(self):
        """Libera memória (Descarga do modelo)."""
        if self.model:
            del self.model
            self.model = None
            logger.info("🧠 Cérebro hibernado (Memória liberada).")
