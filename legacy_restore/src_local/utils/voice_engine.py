"""
🗣️ Motor de Voz Soberano.
Usa a infraestrutura nativa do Windows (SAPI) para comunicação verbal de baixo custo.
"""
import logging
import threading
import pythoncom
import win32com.client

logger = logging.getLogger(__name__)

class VoiceEngine:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(VoiceEngine, cls).__new__(cls)
        return cls._instance

    def speak(self, text):
        """Fala o texto em uma thread separada para não travar o sistema."""
        threading.Thread(target=self._speak_worker, args=(text,), daemon=True).start()

    def _speak_worker(self, text):
        try:
            # Inicializa COM no contexto da thread
            pythoncom.CoInitialize()
            speaker = win32com.client.Dispatch("SAPI.SpVoice")
            
            # Tenta selecionar uma voz em inglês ou português
            # (O padrão do Windows geralmente é bom o suficiente)
            
            speaker.Speak(text)
        except Exception as e:
            logger.error(f"❌ Falha na síntese de voz: {e}")
        finally:
            pythoncom.CoUninitialize()

    def announce_morning_briefing(self, stats):
        """Lê apenas o resumo executivo."""
        bugs = stats.get('bugs_fixed', 0)
        opt = stats.get('processes_killed', 0)
        
        speech = "Good morning, Sir. "
        speech += "Systems are operational. "
        
        if bugs > 0:
            speech += f"I have fixed {bugs} issues in the code base last night. "
        
        if opt > 0:
            speech += f"I also terminated {opt} background processes to optimize performance. "
            
        speech += "Your daily report is on the desktop."
        self.speak(speech)
