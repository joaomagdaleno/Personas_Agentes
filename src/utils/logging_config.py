import logging
import sys

def setup_logging(level=logging.INFO):
    """Configura o sistema de logging para o projeto."""
    # Cores para o terminal (ANSI)
    BLUE = "\033[94m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    RESET = "\033[0m"

    class CustomFormatter(logging.Formatter):
        format_str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        FORMATS = {
            logging.DEBUG: BLUE + format_str + RESET,
            logging.INFO: GREEN + format_str + RESET,
            logging.WARNING: YELLOW + format_str + RESET,
            logging.ERROR: RED + format_str + RESET,
            logging.CRITICAL: RED + format_str + RESET
        }

        def format(self, record):
            """Aplica a cor correspondente ao nível do log antes de formatar a mensagem."""
            log_fmt = self.FORMATS.get(record.levelno)
            formatter = logging.Formatter(log_fmt)
            return formatter.format(record)

    try:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(CustomFormatter())
        
        root_logger = logging.getLogger()
        root_logger.setLevel(level)
        
        # Remove handlers existentes se houver
        for h in root_logger.handlers[:]:
            root_logger.removeHandler(h)
            
        root_logger.addHandler(handler)
    except Exception as e:
        # Fallback para stderr se a configuração falhar
        sys.stderr.write(f"CRÍTICO: Falha ao configurar logging: {e}\n")

# Inicializa por padrão
if not logging.getLogger().handlers:
    setup_logging()
