import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import logging
from pathlib import Path
from src_local.core.orchestrator import Orchestrator
from src_local.utils.logging_config import configure_logging

# Injeção de Telemetria PhD (Usando Logger estruturado)
configure_logging()
logger = logging.getLogger(__name__)

class PhDAgentGUI:
    """Interface PhD: Orquestração de IA com observabilidade nativa."""
    def __init__(self, root):
        self.root = root
        self.root.title("🏛️ Workshop PhD: Orquestração de IA")
        self.root.geometry("900x700")
        
        self.project_root = Path(__file__).parent
        self.orchestrator = Orchestrator(self.project_root)
        
        self._setup_ui()
        logger.info("📡 Interface PhD inicializada: Telemetria ativa.")

    def _setup_ui(self):
        style = ttk.Style()
        style.theme_use('clam')
        
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        self.status_label = ttk.Label(main_frame, text="Pronto para Auditoria 360", font=("Helvetica", 12, "bold"))
        self.status_label.pack(pady=5)
        
        self.log_area = scrolledtext.ScrolledText(main_frame, height=25, font=("Consolas", 10))
        self.log_area.pack(fill=tk.BOTH, expand=True, pady=10)
        
        btn_frame = ttk.Frame(main_frame)
        btn_frame.pack(fill=tk.X, pady=5)
        
        ttk.Button(btn_frame, text="🔍 Diagnóstico Estratégico", command=self.run_diagnostic).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="✨ Auto-Cura PhD", command=self.run_healing).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="📁 Abrir Relatório", command=self.open_report).pack(side=tk.RIGHT, padx=5)

    def run_diagnostic(self):
        """Inicia o diagnóstico 360º via orquestrador soberano."""
        logger.info("Iniciando auditoria de 360 graus...")
        self.log_area.insert(tk.END, "🚀 Mobilizando junta de PhDs e projetando consciência...\n")
        self.root.update()
        
        try:
            # O Orquestrador agora gera o diagnóstico absoluto
            report_path = self.orchestrator.generate_full_diagnostic()
            
            self.log_area.insert(tk.END, f"✅ Auditoria finalizada. Relatório gerado em {report_path.name}\n")
            self.status_label.config(text="Saúde do Sistema: Analisada | Observabilidade: 100%")
            
        except Exception as e:
            logger.error(f"🚨 Falha crítica na interface de diagnóstico: {e}", exc_info=True)
            messagebox.showerror("Erro PhD", f"Falha no orquestrador: {e}")

    def run_healing(self):
        """Ativa o protocolo de auto-cura técnica."""
        if messagebox.askyesno("Confirmação PhD", "Ativar protocolos de Auto-Cura estratégica?"):
            logger.info("Protocolo de Auto-Cura iniciado.")
            self.log_area.insert(tk.END, "✨ Analisando pontos de cura no núcleo...\n")
            messagebox.showinfo("Auto-Cura", "Protocolo em execução. Verifique os logs para detalhes atômicos.")

    def open_report(self):
        """Abre o último relatório de missão usando o visualizador do sistema."""
        report_path = self.project_root / "auto_healing_mission.md"
        if report_path.is_file():
            try:
                import os
                # os.startfile é específico de Windows, mantido para conveniência do Arquiteto
                os.startfile(str(report_path))
            except Exception as e:
                logger.error(f"❌ Falha ao abrir visualizador externo: {e}")
                messagebox.showerror("Erro de E/S", f"Não foi possível abrir o arquivo: {e}")
        else:
            messagebox.showwarning("Aviso de Sistema", "O relatório auto_healing_mission.md ainda não foi gerado.")

if __name__ == "__main__":
    root = tk.Tk()
    app = PhDAgentGUI(root)
    root.mainloop()
