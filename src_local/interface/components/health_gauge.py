import customtkinter as ctk
import math

class HealthGauge(ctk.CTkCanvas):
    """
    🎨 Componente Customizado: Medidor de Saúde PhD.
    Um arco dinâmico que muda de cor conforme a saúde sistêmica.
    """
    def __init__(self, master, size=200, **kwargs):
        super().__init__(master, width=size, height=size, bg=master._fg_color[1] if isinstance(master, ctk.CTkFrame) else "#2b2b2b", highlightthickness=0, **kwargs)
        self.size = size
        self.health = 100
        self._draw_gauge()

    def set_health(self, value):
        self.health = max(0, min(100, value))
        self._draw_gauge()

    def _draw_gauge(self):
        self.delete("all")
        padding = 20
        rect = (padding, padding, self.size - padding, self.size - padding)
        
        # Cor base (traseira)
        self.create_arc(rect, start=-225, extent=270, style="arc", outline="#333333", width=15)
        
        # Cor dinâmica
        color = self._get_color(self.health)
        extent = (self.health / 100) * 270
        self.create_arc(rect, start=-225, extent=extent, style="arc", outline=color, width=15)
        
        # Texto central
        self.create_text(self.size/2, self.size/2, text=f"{int(self.health)}%", fill=color, font=("Segoe UI", 32, "bold"))
        self.create_text(self.size/2, self.size/2 + 35, text="SAÚDE", fill="#888888", font=("Segoe UI", 10, "bold"))

    def _get_color(self, value):
        if value >= 90: return "#00ffcc" # Cyan Soberano
        if value >= 70: return "#ffcc00" # Amarelo Alerta
        if value >= 40: return "#ff6600" # Laranja Crítico
        return "#ff3333" # Vermelho Colapso
