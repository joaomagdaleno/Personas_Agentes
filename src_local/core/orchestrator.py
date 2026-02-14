import subprocess
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class Orchestrator:
    """
    🌉 Bun Bridge: Orchestrator.
    Delegates all calls to the Bun-native TypeScript core.
    """
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.bun_path = "bun"
        self.entry_point = "src_local/run-diagnostic.ts" # or should it call orchestrator.ts directly?

    def set_thinking_depth(self, deep: bool):
        """Sets the depth flag (handled via CLI args in Bun)."""
        self.deep_mode = deep

    def generate_full_diagnostic(self, skip_tests: bool = False):
        """
        Executes the Bun-native diagnostic pipeline.
        """
        cmd = [self.bun_path, "run", "src_local/run-diagnostic.ts", str(self.project_root)]
        if not skip_tests:
            cmd.append("--run-tests")
        
        logger.info(f"🌉 Bridge: Executing {'DEEP' if self.deep_mode else 'PULSE'} diagnostic via Bun...")
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            logger.info("✅ Bun diagnostic completed successfully.")
            # The report path is usually printed by the diagnostic tool
            # For now, we assume it's generated in the project root
            # We return a dummy Path object that shadow_tray expects
            return self.project_root / "diagnostic_report.md"
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Bun diagnostic failed: {e.stderr}")
            raise Exception(f"Bun Execution Error: {e.stderr}")

    def run_strategic_audit(self, context, objective):
        """
        Delegates strategic audit to Bun.
        """
        # Strategic audit might need a specific entry point or arg
        cmd = [self.bun_path, "run", "src_local/run-diagnostic.ts", str(self.project_root), "--objective", objective]
        
        logger.info(f"🌉 Bridge: Executing Strategic Audit for '{objective}' via Bun...")
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            # Parse output for issues (assuming JSON output from Bun)
            # For now, return a placeholder or parse the log
            return [] 
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Bun strategic audit failed: {e.stderr}")
            return []
