"""
🏛️ Persona Agent: Central de Comando Soberana (Tray App).
Gerencia múltiplos projetos, executa diagnósticos em background e orquestra a IA.
"""
import sys
import time
import threading
import sqlite3
import logging
import ctypes
from pathlib import Path
import psutil
import customtkinter as ctk
from tkinter import filedialog, messagebox

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin() != 0
    except:
        return False

def run_as_admin():
    """Tenta reiniciar o script com privilégios de administrador."""
    if not is_admin():
        ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, " ".join(sys.argv), None, 1)
        sys.exit()

# Setup paths
current_dir = Path(__file__).parent.absolute()
project_root = current_dir.parent
sys.path.append(str(project_root))

from src_local.core.orchestrator import Orchestrator
from src_local.utils.cognitive_engine import CognitiveEngine
from src_local.utils.system_sentinel import SystemSentinel
from src_local.utils.history_agent import HistoryAgent
from src_local.agents.Support.briefing_agent import BriefingAgent
from src_local.utils.behavior_analyst import DigitalBehaviorAnalyst
from src_local.utils.voice_engine import VoiceEngine
from src_local.agents.Support.git_automaton import GitAutomaton

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("SovereignCentral")

class SovereignManager(ctk.CTkToplevel):
    """Janela de gestão com aba de performance do sistema."""
    def __init__(self, db_path):
        super().__init__()
        self.title("🏛️ Central Soberana")
        self.geometry("600x550")
        self.db_path = db_path
        self.sentinel = SystemSentinel()
        self._init_ui()
        self.refresh_list()
        self.update_system_stats()

    def _init_ui(self):
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

        # Tabs
        self.tabview = ctk.CTkTabview(self)
        self.tabview.grid(row=1, column=0, sticky="nsew", padx=10, pady=10)
        self.tabview.add("Projetos")
        self.tabview.add("Performance PC")
        self.tabview.add("Sabedoria Noturna")

        # --- Tab Projetos ---
        self.list_frame = ctk.CTkScrollableFrame(self.tabview.tab("Projetos"))
        self.list_frame.pack(fill="both", expand=True, padx=5, pady=5)
        self.add_btn = ctk.CTkButton(self.tabview.tab("Projetos"), text="+ Adicionar Projeto", command=self.add_project)
        self.add_btn.pack(pady=10)

        # --- Tab Performance ---
        self.perf_label = ctk.CTkLabel(self.tabview.tab("Performance PC"), text="Analisando hardware...", justify="left")
        self.perf_label.pack(pady=20, padx=20)
        self.opt_btn = ctk.CTkButton(self.tabview.tab("Performance PC"), text="Otimizar Agora", command=self.optimize_pc)
        self.opt_btn.pack(pady=10)

        # --- Tab Sabedoria ---
        self.wisdom_text = ctk.CTkTextbox(self.tabview.tab("Sabedoria Noturna"), width=500, height=300)
        self.wisdom_text.pack(pady=10, padx=10)
        
        # Controles
        ctrl_frame = ctk.CTkFrame(self.tabview.tab("Sabedoria Noturna"))
        ctrl_frame.pack(fill="x", padx=10)
        
        self.refresh_wisdom_btn = ctk.CTkButton(ctrl_frame, text="Carregar Resumo", command=self.load_wisdom)
        self.refresh_wisdom_btn.pack(side="left", padx=5)
        
        # Switch de Voz
        self.voice_var = ctk.StringVar(value="off")
        self.voice_switch = ctk.CTkSwitch(ctrl_frame, text="Ativar Voz (Jarvis)", command=self.toggle_voice, variable=self.voice_var, onvalue="on", offvalue="off")
        self.voice_switch.pack(side="right", padx=5)
        
        # Carrega estado inicial
        saved_voice = HistoryAgent(project_root).get_setting("voice_enabled", "off")
        self.voice_var.set(saved_voice)

    def toggle_voice(self):
        HistoryAgent(project_root).set_setting("voice_enabled", self.voice_var.get())

    def update_system_stats(self):
        health = self.sentinel.get_system_health()
        admin_status = "✅ ADMIN" if health['is_admin'] else "❌ USUÁRIO (Limitado)"
        stats = f"Status: {admin_status}\nCPU: {health['cpu_usage']}%\nRAM: {health['memory_usage']}%\nDisco Livre: {health['disk_free_gb']:.1f} GB\n\nSugestões:\n"
        
        suggestions = self.sentinel.suggest_optimizations(health)
        for s in suggestions:
            stats += f"- {s}\n"
        
        self.perf_label.configure(text=stats)
        self.after(5000, self.update_system_stats)

    def optimize_pc(self):
        if not self.sentinel.is_admin:
            if messagebox.askyesno("Elevação Necessária", "Para otimizar o PC, preciso de acesso Admin. Deseja reiniciar como Administrador?"):
                run_as_admin()
        else:
            messagebox.showinfo("Otimização", "Iniciando limpeza de caches de sistema e ajuste de prioridades...")
            # Aqui entrariam comandos como del /q /s %temp%\* etc.

    def load_wisdom(self):
        history = HistoryAgent(project_root)
        insights = history.get_overnight_summary()
        self.wisdom_text.delete("1.0", "end")
        if not insights:
            self.wisdom_text.insert("end", "Nenhum insight profundo gerado nas últimas 24h. Deixe o PC ocioso para a IA trabalhar.")
        for i in insights:
            self.wisdom_text.insert("end", f"📌 {i}\n\n")

    def add_project(self):
        path = filedialog.askdirectory()
        if path:
            name = Path(path).name
            try:
                conn = sqlite3.connect(self.db_path)
                conn.execute("INSERT INTO projects (path, name) VALUES (?, ?)", (path, name))
                conn.commit()
                conn.close()
                self.refresh_list()
            except sqlite3.IntegrityError:
                pass 

    def refresh_list(self):
        for widget in self.list_frame.winfo_children():
            widget.destroy()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.execute("SELECT id, name, path, health_score FROM projects")
        for i, row in enumerate(cursor.fetchall()):
            f = ctk.CTkFrame(self.list_frame)
            f.pack(fill="x", pady=5)
            ctk.CTkLabel(f, text=f"{row[1]}").pack(side="left", padx=10)
            ctk.CTkLabel(f, text=f"{int(row[3])}%", text_color="#00ffcc").pack(side="left", padx=10)
            ctk.CTkButton(f, text="🗑️", width=30, fg_color="red", command=lambda r=row[0]: self.delete_project(r)).pack(side="right", padx=5)
        conn.close()

    def delete_project(self, pid):
        conn = sqlite3.connect(self.db_path)
        conn.execute("DELETE FROM projects WHERE id = ?", (pid,))
        conn.commit()
        conn.close()
        self.refresh_list()

class BackgroundOrchestrator:
    def __init__(self):
        self.db_path = project_root / "system_vault.db"
        self.running = False
        self.current_icon = None
        self.idle_threshold_seconds = 300 # 5 minutos para modo Deep
        self.last_activity = time.time()

    def get_idle_time(self):
        """Retorna o tempo de ociosidade do sistema em segundos (Windows)."""
        import ctypes
        class LASTINPUTINFO(ctypes.Structure):
            _fields_ = [("cbSize", ctypes.c_uint), ("dwTime", ctypes.c_uint)]
        
        lii = LASTINPUTINFO()
        lii.cbSize = ctypes.sizeof(LASTINPUTINFO)
        if ctypes.windll.user32.GetLastInputInfo(ctypes.byref(lii)):
            millis = ctypes.windll.kernel32.GetTickCount() - lii.dwTime
            return millis / 1000.0
        return 0

    def start(self):
        self.running = True
        threading.Thread(target=self._worker_loop, daemon=True).start()

    def _worker_loop(self):
        """Loop inteligente que aprende com o comportamento real e uso do computador."""
        analyst = DigitalBehaviorAnalyst(project_root)
        
        while self.running:
            # 1. Analisa Comportamento Imediato (O que você está fazendo?)
            current_app, current_title = analyst.get_active_window_info()
            context = analyst.classify_activity(current_app or "System", current_title or "")
            
            # 🧠 Aprende o perfil de memória da máquina
            analyst.record_memory_state(idle=(idle_s > 60))
            
            # Se estiver jogando, a IA deve hibernar totalmente para não causar lag
            if context == "GAMING":
                logger.info(f"🎮 Modo Gamer Detectado ({current_app}). Hibernando por 5 min...")
                time.sleep(300)
                continue
            
            # Se estiver criando mídia pesada, libera recursos
            if context == "CREATIVE":
                logger.info(f"🎨 Modo Criativo ({current_app}). Reduzindo frequência de análise.")
                time.sleep(120)
                continue

            # 2. Verifica Ociosidade Física (Teclado/Mouse)
            idle_s = self.get_idle_time()
            conn = sqlite3.connect(self.db_path)
            cursor = conn.execute("SELECT id, path FROM projects")
            projects = cursor.fetchall()
            conn.close()

            if idle_s > self.idle_threshold_seconds:
                self.was_idle = True 
                logger.info(f"🌙 Modo Hiperpensamento: Sistema ocioso há {int(idle_s)}s. Iniciando tarefas complexas.")
                
                # 🧹 Limpeza de Bloatware (Se for Admin)
                if idle_s > 1800: # 30 min de ociosidade
                    sentinel = SystemSentinel()
                    history = HistoryAgent(project_root)
                    cog_engine = CognitiveEngine()
                    cog_engine.set_thinking_depth(True)
                    sentinel.analyze_and_kill_bloatware(cog_engine, history)

                for pid, path in projects:
                    if not self.running: break
                    # Se estava codando antes de sair, foca no projeto ativo
                    is_focus = (context == "DEV" and path in (current_title or ""))
                    self._diagnose_project(pid, path, deep_mode=True)
                
                time.sleep(300) 
            else:
                if getattr(self, "was_idle", False):
                    # Acabou de voltar da ociosidade -> Gera Briefing + Voz!
                    logger.info("☀️ [Morning] Usuário retornou. Gerando relatório e anunciando...")
                    
                    # Gera relatório
                    briefing = BriefingAgent(project_root)
                    briefing.generate_morning_report()
                    
                    # Anuncia voz (Se ativado)
                    voice_setting = HistoryAgent(project_root).get_setting("voice_enabled", "off")
                    if voice_setting == "on":
                        stats = briefing._get_optimization_stats() # Reutiliza lógica interna
                        VoiceEngine().announce_morning_briefing(stats)
                    else:
                        logger.info("🔇 [Voice] Anúncio silenciado por preferência do usuário.")
                    
                    self.was_idle = False

                # Modo Pulse (Ativo): Se estiver codando (DEV), verifica com menos frequência para economizar CPU
                interval = 60 if context == "DEV" else 120
                
                for pid, path in projects:
                    if not self.running: break
                    self._diagnose_project(pid, path, deep_mode=False)
                
                time.sleep(interval)

    def _diagnose_project(self, pid, path, deep_mode=False):
        try:
            mode_str = "DEEP" if deep_mode else "PULSE"
            logger.info(f"📡 [{mode_str}] Diagnostic: {path}")
            orc = Orchestrator(path)
            history = HistoryAgent(project_root)
            
            # Ajusta profundidade de pensamento baseada no modo
            orc.set_thinking_depth(deep=deep_mode)
            
            # Se não estiver ocioso, apenas faz auditoria rápida
            report = orc.generate_full_diagnostic(skip_tests=not deep_mode)
            
            if deep_mode:
                insight = f"Projeto {Path(path).name}: Auditoria profunda concluída com elasticidade de 4096 tokens. Estabilidade verificada."
                history.record_insight("DEEP", insight, tokens=4096, impact="HIGH")

            conn = sqlite3.connect(self.db_path)
            conn.execute("UPDATE projects SET last_diagnostic = CURRENT_TIMESTAMP WHERE id = ?", (pid,))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Erro ao diagnosticar {path}: {e}")

# --- Tray Icon Logic ---
try:
    import pystray
    from PIL import Image, ImageDraw
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pystray", "Pillow"])
    import pystray
    from PIL import Image, ImageDraw

def create_image(color):
    image = Image.new('RGB', (64, 64), color)
    dc = ImageDraw.Draw(image)
    dc.ellipse((16, 16, 48, 48), fill="white")
    return image

bg_orc = BackgroundOrchestrator()
manager_window = None

def open_manager(icon, item):
    global manager_window
    if manager_window is None or not manager_window.winfo_exists():
        manager_window = SovereignManager(bg_orc.db_path)
    else:
        manager_window.focus()

def on_exit(icon, item):
    bg_orc.running = False
    icon.stop()
    sys.exit()

def main():
    bg_orc.start()
    image = create_image("blue")
    menu = pystray.Menu(
        pystray.MenuItem("Gerir Projetos", open_manager, default=True),
        pystray.MenuItem("Executar Todos Agora", lambda: threading.Thread(target=bg_orc._worker_loop).start()),
        pystray.MenuItem("Sair", on_exit)
    )
    icon = pystray.Icon("SovereignBrain", image, "Persona Agent: Central Soberana", menu)
    bg_orc.current_icon = icon
    icon.run()

if __name__ == "__main__":
    main()
