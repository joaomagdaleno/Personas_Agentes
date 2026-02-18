import os
import requests
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - Cognitive - %(levelname)s - %(message)s')
logger = logging.getLogger("CognitiveEngine")

class CognitiveEngine:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CognitiveEngine, cls).__new__(cls)
            cls._instance.initialized = False
        return cls._instance

    def __init__(self):
        if self.initialized:
            return
            
        self.model_name = "qwen2.5-coder:1.5b"
        self.endpoint = os.environ.get("AI_ENDPOINT", "http://localhost:11434/api/generate")
        self.default_max_tokens = 512
        self.memory_limit = 85
        self.active_model = None
        self.initialized = True
        logger.info("🧠 [Cognitive] Motor de Raciocínio Python inicializado.")

    def set_thinking_depth(self, is_deep=False):
        """Ajusta a profundidade de pensamento (Legacy logic)."""
        if is_deep:
            self.default_max_tokens = 4096
            logger.info("🧠 [Cognitive] Modo HIPERPENSAMENTO ativado (Contexto Expandido).")
        else:
            self.default_max_tokens = 512
            logger.info("🧠 [Cognitive] Modo PULSE ativado (Resposta Rápida).")

    def _check_vitals(self):
        """Verifica as condições de hardware antes de raciocinar."""
        # Mock simplificado por falta de psutil garantido em todos os ambientes
        return True

    def reason(self, prompt, temperature=0.7, max_tokens=None, deep=False):
        """Processa um pensamento usando o modelo de linguagem local."""
        if deep:
            self.set_thinking_depth(True)

        if not self._check_vitals():
            return None

        actual_max_tokens = max_tokens or self.default_max_tokens
        logger.info(f"🧠 [Cognitive] Raciocinando sobre objetivo...")

        try:
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": actual_max_tokens
                }
            }
            response = requests.post(self.endpoint, json=payload, timeout=30)
            
            if response.status_code != 200:
                logger.warning(f"⚠️ [Cognitive] API indisponível ({response.status_code}).")
                return None

            data = response.json()
            self.active_model = self.model_name
            return data.get("response")
        except Exception as e:
            logger.error(f"❌ [Cognitive] Falha na conexão com o Cérebro: {e}")
            return None

    def release(self):
        """Libera o modelo da memória (Unload)."""
        logger.info("🧠 [Cognitive] Solicitando liberação de VRAM...")
        try:
            requests.post("http://localhost:11434/api/generate", json={
                "model": self.model_name,
                "keep_alive": 0
            }, timeout=5)
            self.active_model = None
        except:
            logger.warning("⚠️ [Cognitive] Não foi possível descarregar o modelo via API.")

    @property
    def model(self):
        return self.active_model

    @staticmethod
    def get_instance():
        return CognitiveEngine()
