"""
🕵️‍♂️ Analista Comportamental Digital.
Monitora o foco do usuário para adaptar a estratégia da IA ao contexto real.
"""
import time
import logging
import psutil
import ctypes
from pathlib import Path
import sqlite3
from datetime import datetime

logger = logging.getLogger(__name__)

class DigitalBehaviorAnalyst:
    def __init__(self, project_root):
        self.db_path = Path(project_root) / "system_vault.db"
        self._init_db()
        self.last_app = None
        self.start_time = time.time()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_activity (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                app_name TEXT,
                window_title TEXT,
                category TEXT,
                duration_seconds INTEGER
            )
        """)
        # Tabela para aprender o perfil de hardware do usuário
        conn.execute("""
            CREATE TABLE IF NOT EXISTS memory_baseline (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                ram_percent FLOAT,
                is_idle BOOLEAN
            )
        """)
        conn.commit()
        conn.close()

    def get_active_window_info(self):
        """Obtém o nome do processo e título da janela em foco no Windows."""
        try:
            user32 = ctypes.windll.user32
            kernel32 = ctypes.windll.kernel32
            
            hwnd = user32.GetForegroundWindow()
            if not hwnd: return None, None
            
            pid = ctypes.c_ulong()
            user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
            
            if pid.value == 0: return None, None

            process = psutil.Process(pid.value)
            app_name = process.name()
            
            length = user32.GetWindowTextLengthW(hwnd)
            buff = ctypes.create_unicode_buffer(length + 1)
            user32.GetWindowTextW(hwnd, buff, length + 1)
            window_title = buff.value
            
            return app_name, window_title
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            return "System", "Protected Process"
        except Exception as e:
            return None, None

    def record_memory_state(self, idle: bool):
        """Grava o estado atual da memória para calcular a média histórica."""
        try:
            ram = psutil.virtual_memory().percent
            conn = sqlite3.connect(self.db_path)
            conn.execute("INSERT INTO memory_baseline (ram_percent, is_idle) VALUES (?, ?)", (ram, idle))
            # Mantém apenas os últimos 1000 registros para aprendizado recente
            conn.execute("DELETE FROM memory_baseline WHERE id NOT IN (SELECT id FROM memory_baseline ORDER BY id DESC LIMIT 1000)")
            conn.commit()
            conn.close()
        except: pass

    def get_smart_memory_limit(self):
        """Calcula o limite seguro baseado no histórico do usuário."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.execute("SELECT AVG(ram_percent) FROM memory_baseline WHERE is_idle = 1")
            avg_idle = cursor.fetchone()[0]
            conn.close()
            
            if not avg_idle: return 90.0 # Valor padrão caso não tenha dados
            
            # O limite é a média + uma margem de manobra (ex: se média é 85%, limite vira 95%)
            # Nunca excede 97% para evitar crash do Windows
            smart_limit = min(avg_idle + 10.0, 97.0)
            return smart_limit
        except:
            return 90.0

    def classify_activity(self, app_name, window_title):
        """Classifica o que o usuário está fazendo."""
        app = app_name.lower()
        title = window_title.lower() if window_title else ""

        # 1. Gaming (Prioridade Máxima de Silêncio)
        games = ["steam.exe", "cs2.exe", "dota2.exe", "valorant.exe", "gta5.exe", "minecraft.exe"]
        if app in games or "game" in title:
            return "GAMING"

        # 2. Development (IA deve ajudar)
        dev_tools = ["code.exe", "pycharm64.exe", "powershell.exe", "cmd.exe", "windowsterminal.exe", "sublime_text.exe"]
        if app in dev_tools or ".py" in title or "github" in title:
            return "DEV"

        # 3. Creative (Precisa de RAM)
        creative = ["photoshop.exe", "premiere.exe", "blender.exe", "afterfx.exe", "obs64.exe"]
        if app in creative:
            return "CREATIVE"

        # 4. Browsing/General (Incluindo Samsung Internet)
        browsers = ["chrome.exe", "firefox.exe", "msedge.exe", "opera.exe", "samsunginternet.exe", "brave.exe"]
        if app in browsers:
            if "youtube" in title or "netflix" in title:
                return "MEDIA"
            return "BROWSING"

        return "GENERAL"
        """Obtém o nome do processo e título da janela em foco no Windows."""
        try:
            user32 = ctypes.windll.user32
            kernel32 = ctypes.windll.kernel32
            
            hwnd = user32.GetForegroundWindow()
            if not hwnd: return None, None
            
            pid = ctypes.c_ulong()
            user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
            
            if pid.value == 0: return None, None

            process = psutil.Process(pid.value)
            app_name = process.name()
            
            length = user32.GetWindowTextLengthW(hwnd)
            buff = ctypes.create_unicode_buffer(length + 1)
            user32.GetWindowTextW(hwnd, buff, length + 1)
            window_title = buff.value
            
            return app_name, window_title
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            return "System", "Protected Process"
        except Exception as e:
            return None, None

    def classify_activity(self, app_name, window_title):
        """Classifica o que o usuário está fazendo."""
        app = app_name.lower()
        title = window_title.lower() if window_title else ""

        # 1. Gaming (Prioridade Máxima de Silêncio)
        games = ["steam.exe", "cs2.exe", "dota2.exe", "valorant.exe", "gta5.exe", "minecraft.exe"]
        if app in games or "game" in title:
            return "GAMING"

        # 2. Development (IA deve ajudar)
        dev_tools = ["code.exe", "pycharm64.exe", "powershell.exe", "cmd.exe", "windowsterminal.exe", "sublime_text.exe"]
        if app in dev_tools or ".py" in title or "github" in title:
            return "DEV"

        # 3. Creative (Precisa de RAM)
        creative = ["photoshop.exe", "premiere.exe", "blender.exe", "afterfx.exe", "obs64.exe"]
        if app in creative:
            return "CREATIVE"

        # 4. Browsing/General
        browsers = ["chrome.exe", "firefox.exe", "msedge.exe", "opera.exe"]
        if app in browsers:
            if "youtube" in title or "netflix" in title:
                return "MEDIA"
            return "BROWSING"

        return "GENERAL"

    def log_activity(self):
        """Registra a atividade atual e retorna a categoria para decisão imediata."""
        app_name, window_title = self.get_active_window_info()
        
        if not app_name: return "UNKNOWN"

        category = self.classify_activity(app_name, window_title)
        
        # Lógica de log (evita floodar o banco a cada segundo)
        now = time.time()
        if self.last_app != app_name:
            if self.last_app:
                # Salva a sessão anterior
                duration = int(now - self.start_time)
                self._save_to_db(self.last_app, self.last_title, self.last_category, duration)
            
            # Inicia nova sessão
            self.last_app = app_name
            self.last_title = window_title
            self.last_category = category
            self.start_time = now
            logger.info(f"👀 Foco alterado: {app_name} ({category})")
            
        return category

    def _save_to_db(self, app, title, category, duration):
        if duration < 5: return # Ignora trocas muito rápidas (alt+tab acidental)
        try:
            conn = sqlite3.connect(self.db_path)
            conn.execute("INSERT INTO user_activity (app_name, window_title, category, duration_seconds) VALUES (?, ?, ?, ?)",
                         (app, title, category, duration))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Erro ao salvar atividade: {e}")
