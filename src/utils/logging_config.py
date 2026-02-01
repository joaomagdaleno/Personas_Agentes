import logging
import sys

def configure_logging(level=logging.INFO):
    """Configura o sistema de logging PhD resiliente."""
    # Cores simples para evitar erros de format string
    class SimpleFormatter(logging.Formatter):
        def format(self, record):
            # Formatação manual para garantir estabilidade absoluta
            level_name = record.levelname
            msg = record.getMessage()
            time_str = self.formatTime(record, self.datefmt)
            return f"{time_str} - {record.name} - {level_name} - {msg}"

    try:
        # Força UTF-8 no StreamHandler para suportar emojis no Windows
        import io
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8')
        
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(SimpleFormatter())
        root = logging.getLogger()
        root.setLevel(level)
        for h in root.handlers[:]: root.removeHandler(h)
        root.addHandler(handler)
    except Exception as e:
        sys.stderr.write(f"Falha fatal no logging: {e}\n")

def setup_logging(level=logging.INFO): configure_logging(level)

if not logging.getLogger().handlers: configure_logging()

