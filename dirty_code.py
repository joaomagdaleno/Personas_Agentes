# Arquivo para testar Auto-Cura
import os

DEBUG = os.getenv('DEBUG', 'False') == 'True'

def bad_function():
    try:
        x = 1 / 0
    except Exception as e:
            logger.error(f'Erro capturado: {e}')

logger.info("Iniciando programa sujo...")
