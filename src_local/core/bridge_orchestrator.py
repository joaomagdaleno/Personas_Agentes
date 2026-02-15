
import subprocess
import json
import logging
import sqlite3
import threading
from pathlib import Path
from typing import Optional, Dict, List, Any

# Configure logging
logger = logging.getLogger("BridgeOrchestrator")

class BridgeOrchestrator:
    """
    🌉 The Lazarus Bridge
    ---------------------
    Adapts legacy Python GUI calls to the new Bun/TypeScript Core.
    Acts as a proxy for the 'Orchestrator' class that used to exist in Python.
    """

    def __init__(self, project_root: str):
        self.project_root = Path(project_root).resolve()
        self.db_path = self.project_root / "system_vault.db"
        self.on_health_update = None
        self.on_findings_update = None
        self.memory_engine = self # Mock memory engine for now
        
        # Determine Bun executable (assume it's in PATH or standard location)
        self.bun_cmd = "bun" 

        logger.info(f"🌉 BridgeOrchestrator bound to: {self.project_root}")

    def generate_full_diagnostic(self, skip_tests: bool = False) -> Path:
        """
        Calls the Bun diagnostic engine via subprocess.
        Returns the path to the generated report.
        """
        logger.info("🌉 Bridge: Requesting Full Diagnostic via Bun...")
        
        cmd = [self.bun_cmd, "run", "run-diagnostic.ts", str(self.project_root)]
        
        # Map parameters to CLI args
        # Note: run-diagnostic.ts currently takes root as arg. 
        # We might need to ensure arguments match what run-diagnostic.ts expects.
        # Based on previous analysis: bun run run-diagnostic.ts <root> [--auto-heal] [--dry-run]
        
        try:
            # Execute Bun process
            # We capture stdout/stderr to log them
            process = subprocess.run(
                cmd, 
                cwd=self.project_root,
                capture_output=True,
                text=True,
                encoding='utf-8',
                check=False # We handle errors manually
            )

            if process.returncode != 0:
                logger.error(f"❌ Bun Validation Failed:\n{process.stderr}")
                raise RuntimeError(f"Diagnostic failed with code {process.returncode}")

            logger.info("✅ Bun Diagnostic Complete.")
            logger.debug(f"Bun Output: {process.stdout}")
            
            # After run, fetch latest data from DB to update UI
            self._sync_ui_state()

            return self.project_root / "docs" / "auto_healing_VERIFIED.md"

        except FileNotFoundError:
             logger.error("❌ Bun executable not found. Is Bun installed?")
             raise RuntimeError("Bun executable not found.")
        except Exception as e:
            logger.error(f"❌ Bridge Error: {e}")
            raise

    def run_auto_healing(self, findings: List[Any]) -> int:
        """
        Triggers auto-healing via Bun.
        """
        logger.info("🌉 Bridge: Requesting Auto-Healing via Bun...")
        cmd = [self.bun_cmd, "run", "run-diagnostic.ts", str(self.project_root), "--auto-heal"]
        
        try:
            process = subprocess.run(
                cmd,
                cwd=self.project_root,
                capture_output=True,
                text=True,
                encoding='utf-8'
            )
            
            if process.returncode != 0:
                logger.error(f"❌ Bun Healing Failed:\n{process.stderr}")
                return 0

            # Heuristic: Parse output for "healed" count or just re-sync
            logger.info("✅ Bun Healing Complete.")
            self._sync_ui_state()
            return 1 # Return >0 to indicate success/attempt
            
        except Exception as e:
            logger.error(f"❌ Bridge Healing Error: {e}")
            return 0

    def set_thinking_depth(self, deep: bool):
        """Legacy method stub."""
        logger.info(f"bridge: Thinking depth set to {'DEEP' if deep else 'SHALLOW'} (Stub)")

    def _sync_ui_state(self):
        """
        Reads from system_vault.db and updates the GUI via callbacks.
        """
        if not self.db_path.exists():
            return

        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            
            # Get latest health score
            cursor = conn.execute("SELECT score, breakdown_json FROM health_history ORDER BY timestamp DESC LIMIT 1")
            row = cursor.fetchone()
            
            if row and self.on_health_update:
                health_data = {
                    "health_score": row["score"],
                    "breakdown": json.loads(row["breakdown_json"]) if row["breakdown_json"] else {}
                }
                self.on_health_update(health_data)

            # For findings, we might need a separate table or read from a JSON file if DB doesn't have them detailed.
            # The current AuditEngine writes to stability_ledger (which is a JSON/DB hybrid or just logic)
            # Actually StabilityLedger writes to .gemini/stability_ledger.json
            # Let's read that.
            ledger_path = self.project_root / ".gemini" / "stability_ledger.json"
            if ledger_path.exists() and self.on_findings_update:
                with open(ledger_path, "r", encoding="utf-8") as f:
                    ledger = json.load(f)
                    # Convert ledger dict to findings list
                    findings = []
                    for file, data in ledger.items():
                         if data.get("status") == "UNSTABLE":
                             findings.append({
                                 "file": file,
                                 "issue": "Instability Detected",
                                 "severity": "HIGH"
                             })
                    self.on_findings_update(findings)

            conn.close()
            
        except Exception as e:
            logger.error(f"Error syncing UI state: {e}")

    # --- Cognitive Engine Mocking ---
    def add_persona(self, persona: Any):
        """ Stub for Persona Loader compatibility. """
        # We don't need to actually load Python personas into the Bridge 
        # because the real work is done by the Bun engine (which has its own personas).
        # We just log it to confirm the loader is working.
        logger.info(f"bridge: Mock-loaded persona: {item_name(persona)}")

def item_name(item):
    return getattr(item, 'name', str(item))

