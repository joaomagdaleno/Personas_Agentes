"""
🔌 API Soberana Headless.
Disponibiliza o status do sistema e o chat cognitivo via HTTP.
"""
from fastapi import FastAPI
import uvicorn
import logging
import os
import sys
from pathlib import Path

# Add project root to sys.path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from src_local.core.orchestrator import Orchestrator

app = FastAPI(title="Persona Agent Soberano API")
orc = Orchestrator(str(project_root))

@app.get("/status")
def get_status():
    """Retorna a saúde atual do projeto."""
    # Roda um diagnóstico rápido para pegar o snapshot mais recente
    ctx = orc.context_engine.analyze_project()
    health = orc.core_validator.validate_system_integrity(ctx)
    return {
        "project": "Personas Agentes",
        "health_score": health.get("score"),
        "components": len(ctx.get("map", {}))
    }

@app.get("/chat")
def chat(q: str):
    """Consulta o Cérebro Local via API."""
    from src_local.utils.cognitive_engine import CognitiveEngine
    brain = CognitiveEngine()
    response = brain.reason(q)
    return {"query": q, "response": response}

if __name__ == "__main__":
    print("🔌 API Soberana Iniciando em http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, workers=1)
