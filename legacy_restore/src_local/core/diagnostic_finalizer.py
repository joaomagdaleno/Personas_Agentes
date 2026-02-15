import os
import logging
import sqlite3
from pathlib import Path

logger = logging.getLogger(__name__)

class DiagnosticFinalizer:
    """Finalizador soberano que automatiza a cura cognitiva do sistema."""
    
    @staticmethod
    def finalize(pipeline, ctx, health, findings):
        orc = pipeline.orc
        snapshot = orc.get_system_health_360(ctx, health, findings)
        
        # 📊 Grava Histórico Soberano
        from src_local.utils.history_agent import HistoryAgent
        HistoryAgent(orc.project_root).record_snapshot(
            snapshot["health_score"], 
            len(findings),
            sum(f.get("complexity", 1) for f in ctx.get("map", {}).values()) / max(1, len(ctx.get("map", {})))
        )
        
        # Ativa a Camada de Autocura Cognitiva
        DiagnosticFinalizer._run_cognitive_healing(orc, snapshot, findings)
        
        orc.synthesizer.trigger_reflexes(snapshot, orc.personas, findings, orc.dependency_auditor)
        orc.cache_manager.save()
        
        return DiagnosticFinalizer._persist_report(orc, snapshot, findings)

    @staticmethod
    def _run_cognitive_healing(orc, snapshot, findings):
        """Agenda tarefas para o Shadow Worker via banco de dados."""
        import sqlite3
        conn = sqlite3.connect(orc.project_root / "system_vault.db")
        
        # 1. Agenda Documentação (Queue)
        mudos = [f for f in snapshot.get("dark_matter", [])][:5]
        for path in mudos:
            DiagnosticFinalizer._queue_task(conn, "DOC_GEN", path)

        # 2. Agenda Testes (Queue)
        cegos = [f for f in snapshot.get("dark_matter", []) if not orc.project_root.joinpath(f"tests/test_{Path(f).name}") .exists()][:5]
        for path in cegos:
            DiagnosticFinalizer._queue_task(conn, "TEST_GEN", path)
            
        conn.close()

    @staticmethod
    def _queue_task(conn, type, target):
        # Evita duplicatas pendentes
        cursor = conn.execute("SELECT id FROM ai_tasks WHERE target_file = ? AND task_type = ? AND status = 'PENDING'", (target, type))
        if not cursor.fetchone():
            conn.execute("INSERT INTO ai_tasks (task_type, target_file) VALUES (?, ?)", (type, target))
            conn.commit()
            logger.info(f"📥 [Queue] Tarefa agendada: {type} para {target}")

    @staticmethod
    def _analyze_critical_findings(orc, findings):
        # Mantém análise de erro síncrona se for crítica, ou move para queue depois
        pass

    @staticmethod
    def _auto_doc(orc, rel_path):
        pass # Deprecated by Queue

    @staticmethod
    def _auto_test(orc, rel_path):
        pass # Deprecated by Queue

    @staticmethod
    def _persist_report(orc, snapshot, findings):
        if os.environ.get("DIAGNOSTIC_TEST_MODE") == "1": return Path("test_report_suppressed.md")
        
        report = orc.director.format_360_report(snapshot, findings)
        path = orc.project_root / "docs" / "auto_healing_VERIFIED.md"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(report, encoding="utf-8")
        return path
