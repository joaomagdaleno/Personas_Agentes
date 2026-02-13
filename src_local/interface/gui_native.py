import customtkinter as ctk
import logging
import threading
from typing import Optional
import tkinter as tk

from src_local.interface.components.sidebar import SidebarComponent
from src_local.interface.views.dashboard_view import DashboardView
from src_local.interface.views.findings_view import FindingsView
from src_local.interface.views.chat_view import ChatView

logger = logging.getLogger(__name__)

class NativeGUI(ctk.CTk):
    """
    💎 Dashboard Sincronizado 2026.
    Interface nativa modularizada de baixo consumo.
    """
    def __init__(self, orchestrator):
        super().__init__()
        self.orc = orchestrator
        if self.orc:
            self.orc.on_health_update = self._update_health_ui
            self.orc.on_findings_update = self._update_findings_ui
            
        self.title("🏛️ Persona Agent: Soberania Sistêmica 2026")
        self.geometry("1100x700")
        
        # Tema Soberano: Dark Tech
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")

        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        self._init_components()
        logger.info("🎨 Interface Nativa Inicializada (Modular).")

    def _init_components(self):
        callbacks = {
            'run_audit': self.run_audit_async,
            'open_report': self.open_report,
            'auto_heal': self.run_auto_healing_async,
            'show_dashboard': lambda: self._show_view("dashboard"),
            'show_findings': lambda: self._show_view("findings"),
            'show_chat': lambda: self._show_view("chat")
        }
        self.sidebar = SidebarComponent(self, callbacks)

        self.main_container = ctk.CTkFrame(self, corner_radius=10, fg_color="transparent")
        self.main_container.grid(row=0, column=1, sticky="nsew", padx=20, pady=20)
        self.main_container.grid_columnconfigure(0, weight=1)
        self.main_container.grid_rowconfigure(0, weight=1)

        self.views = {}
        self.views["dashboard"] = DashboardView(self.main_container)
        
        findings_callbacks = {'copy_fix': self._copy_selected_issue}
        self.views["findings"] = FindingsView(self.main_container, findings_callbacks)
        
        chat_callbacks = {'send_chat': self._handle_chat_query}
        self.views["chat"] = ChatView(self.main_container, chat_callbacks)

        self._show_view("dashboard")

    def _show_view(self, view_name):
        for name, frame in self.views.items():
            if name == view_name:
                frame.grid(row=0, column=0, sticky="nsew")
            else:
                frame.grid_forget()

    def _update_health_ui(self, health_data):
        score = health_data.get("health_score", 100)
        self.after(0, lambda: self.views["dashboard"].update_health(score))

    def _update_findings_ui(self, findings):
        count = len(findings)
        self.after(0, lambda: self.views["dashboard"].update_findings_count(count))
        self.after(0, lambda: self.views["dashboard"].log_findings(findings))
        
        # Update Findings View logic needs adapter since it uses widgets
        # We need to bridge the Gap
        self.after(0, lambda: self._refresh_findings_view(findings))

    def _refresh_findings_view(self, findings):
        # Delegate to view
        # We need to adapt the logic because FindingsView expects detailed list
        # But here we have generic logic. Ideally FindingsView handles it.
        # Check FindingsView implementation: it has refresh_findings method
        view = self.views["findings"]
        # Correctly call the method on the instance
        view.refresh_findings(findings)
        self.last_findings = findings

    def log_message(self, msg: str, level: str = "INFO"):
        self.after(0, lambda: self.views["dashboard"].log(msg, level))

    def run_audit_async(self):
        if not self.orc: return
        self.sidebar.update_status("Status: Analisando...", "yellow")
        self.sidebar.set_running_state(True)
        self.log_message("🚀 Mobilizando junta de PhDs para Auditoria 360...", "SYSTEM")
        
        def job():
            try:
                report_path = self.orc.generate_full_diagnostic()
                self.after(0, lambda: self.sidebar.update_status("Status: Protegido", "#00ffcc"))
                self.after(0, lambda: self.sidebar.set_running_state(False))
                self.log_message(f"✅ Auditoria concluída. Relatório em: {report_path.name}", "SUCCESS")
            except Exception as e:
                logger.error(f"Erro na auditoria UI: {e}", exc_info=True)
                self.after(0, lambda: self.sidebar.update_status("Status: Erro", "red"))
                self.after(0, lambda: self.sidebar.set_running_state(False))
                self.log_message(f"🚨 Falha Crítica: {e}", "ERROR")

        threading.Thread(target=job, daemon=True).start()

    def run_auto_healing_async(self):
        if not self.orc or not hasattr(self, "last_findings"): 
            self.log_message("⚠️ Execute uma auditoria primeiro.", "WARNING")
            return
            
        self.sidebar.update_status("Status: Curando...", "#cf6679")
        self.sidebar.set_healing_state(True)
        self.log_message("🩹 Iniciando Ciclo de Auto-Cura...", "HEAL")
        
        def job():
            try:
                count = self.orc.run_auto_healing(self.last_findings)
                if count > 0:
                    self.log_message(f"✨ Auto-cura aplicada em {count} arquivos.", "SUCCESS")
                    self.run_audit_async()
                else:
                    self.log_message("🩹 Nenhuma fragilidade crítica curável.", "INFO")
                    self.after(0, lambda: self.sidebar.update_status("Status: Protegido", "#00ffcc"))
                
                self.after(0, lambda: self.sidebar.set_healing_state(False))
            except Exception as e:
                logger.error(f"Erro na auto-cura UI: {e}", exc_info=True)
                self.after(0, lambda: self.sidebar.update_status("Status: Erro", "red"))
                self.after(0, lambda: self.sidebar.set_healing_state(False))

        threading.Thread(target=job, daemon=True).start()

    def open_report(self):
        report_path = self.orc.project_root / "docs" / "auto_healing_VERIFIED.md"
        if report_path.is_file():
            try:
                import os
                os.startfile(str(report_path))
                self.log_message(f"📂 Abrindo relatório: {report_path.name}")
            except Exception as e:
                self.log_message(f"❌ Falha ao abrir relatório: {e}", "ERROR")
        else:
            self.log_message("⚠️ Relatório ainda não gerado.", "WARNING")

    def _copy_selected_issue(self):
        self.log_message("Funcionalidade de cópia em integração PhD.", "INFO")

    def _handle_chat_query(self, query):
        self.log_message(f"🧠 Processando: {query}", "COGNITIVE")
        
        def think():
            try:
                from src_local.utils.cognitive_engine import CognitiveEngine
                brain = CognitiveEngine()
                response = brain.reason(query, memory=self.orc.memory_engine) or "Sem resposta."
                self.after(0, lambda: self.views["chat"].add_message(f"🤖 Cérebro: {response}\n"))
            except Exception as e:
                self.after(0, lambda: self.views["chat"].add_message(f"🚨 Erro: {e}\n"))
        
        threading.Thread(target=think, daemon=True).start()

if __name__ == "__main__":
    from src_local.core.orchestrator import Orchestrator
    orc = Orchestrator(".")
    app = NativeGUI(orc)
    app.mainloop()
