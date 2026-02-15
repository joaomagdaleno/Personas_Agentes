import logging
import os
from pathlib import Path
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Carrega variáveis de ambiente (.env)
load_dotenv()

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
        
        from src_local.utils.resource_governor import ResourceGovernor
        self.profile = ResourceGovernor.get_performance_profile()
        
        self.model = None
        self.model_path = None
        self.context_window = self.profile["ai_ctx"]
        self.default_max_tokens = 512
        self._initialized = True
        self.model_name = "Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF"
        self.model_file = "qwen2.5-coder-1.5b-instruct-q4_k_m.gguf"

    def set_thinking_depth(self, deep: bool = False):
        """Ajusta a capacidade de saída baseado no modo de operação."""
        if deep:
            self.default_max_tokens = 4096 # Hiperpensamento: Muito mais tokens
            logger.info("🧠 [Cognitive] Modo Hiperpensamento ATIVADO (Contexto Expandido).")
        else:
            self.default_max_tokens = 512 # Modo Pulse: Rápido e econômico
            logger.info("🧠 [Cognitive] Modo Pulse ATIVADO (Resposta Rápida).")

    def load_model(self) -> bool:
        """Carrega o modelo na memória (Lazy Loading com Adaptive Memory Baseline)."""
        if self.model: return True
        
        # 🛡️ Inteligência de Memória Adaptativa
        import psutil
        from src_local.utils.behavior_analyst import DigitalBehaviorAnalyst
        
        mem = psutil.virtual_memory()
        analyst = DigitalBehaviorAnalyst(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        smart_limit = analyst.get_smart_memory_limit()
        
        # Verifica se o disco está sendo muito usado (Thrashing)
        # Se Disk Usage > 90%, o swap está engasgado -> NÃO RODAR
        disk_io_busy = psutil.disk_usage('/').percent > 95
        
        # Permite rodar se estiver abaixo do limite inteligente OU se tiver swap disponível sem thrashing
        can_run = (mem.percent < smart_limit) and not disk_io_busy
        
        if not can_run:
            logger.warning(f"⚠️ [Cognitive] Esperando memória. Atual: {mem.percent}% (Limite Aprendido: {smart_limit:.1f}%) | Disco: {psutil.disk_usage('/').percent}%")
            return False

        try:
            from huggingface_hub import hf_hub_download
            from llama_cpp import Llama
            import gc
            gc.collect() 
            
            logger.info(f"🧠 Inicializando (RAM: {mem.percent}% | Baseline: {smart_limit:.1f}%)...")
            
            self.model_path = hf_hub_download(
                repo_id=self.model_name,
                filename=self.model_file,
                local_files_only=os.path.exists(os.path.join(os.path.expanduser("~"), ".cache", "huggingface", "hub"))
            )
            
            if not os.path.exists(self.model_path):
                self.model_path = hf_hub_download(repo_id=self.model_name, filename=self.model_file)
            
            self.model = Llama(
                model_path=self.model_path,
                n_ctx=self.context_window,
                n_threads=max(1, self.profile["ai_threads"] - 1),
                n_batch=256,
                verbose=False
            )
            
            logger.info("🧠 Cérebro online.")
            return True
            
        except ImportError:
            logger.warning("⚠️ Dependências de IA não encontradas (llama-cpp-python).")
            return False
        except Exception as e:
            logger.error(f"❌ Falha ao carregar cérebro: {e}")
            return False

    def reason(self, prompt: str, max_tokens: Optional[int] = None, memory: Any = None, grammar: str = None, temperature: float = 0.7) -> Optional[str]:
        """Processa um pensamento e DESCARREGA IMEDIATAMENTE."""
        if not self.load_model(): return None
        
        target_tokens = max_tokens or self.default_max_tokens
        
        rag_context = ""
        if memory:
            rag_context = memory.search_context(prompt)
            if rag_context: logger.info("🧠 [RAG] Contexto injetado.")

        result = None
        try:
            from llama_cpp import LlamaGrammar

            system_msg = "Você é uma IA assistente técnica especializada em Python."
            if rag_context: system_msg += f"\n\n{rag_context}"
                
            formatted_prompt = f"<|im_start|>system\n{system_msg}<|im_end|>\n<|im_start|>user\n{prompt}<|im_end|>\n<|im_start|>assistant\n"
            
            # Compila a gramática se fornecida
            llama_grammar = None
            if grammar:
                try:
                    llama_grammar = LlamaGrammar.from_string(grammar)
                    logger.info("🧠 [Grammar] Restrição estrutural aplicada.")
                except Exception as g_err:
                    logger.error(f"❌ Erro na gramática: {g_err}")

            output = self.model(
                formatted_prompt,
                max_tokens=target_tokens,
                stop=["<|im_end|>", "<|endoftext|>"],
                echo=False,
                grammar=llama_grammar,
                temperature=temperature
            )
            result = output['choices'][0]['text'].strip()
            
        except Exception as e:
            logger.error(f"❌ Falha no raciocínio: {e}")
        finally:
            self.release() # 🧹 Limpeza garantida
            
        return result

    def release(self):
        """Libera memória forçadamente."""
        if self.model:
            del self.model
            self.model = None
            import gc
            gc.collect()
            logger.info("🧠 Cérebro hibernado (RAM liberada).")
