import subprocess
import sys
from pathlib import Path

def main():
    """Fast Diagnostic: Redirects to the Bun diagnostic engine."""
    print("[*] Redirecting to Bun Diagnostic...")
    
    project_root = Path(__file__).parent.parent.absolute()
    
    try:
        # Execute the Bun diagnostic command
        # This allows the Git hook to verify the actual active system (Bun)
        # Added --dry-run to prevent loop (modifying files during commit)
        result = subprocess.run(
            ["bun", "run", "run-diagnostic.ts", ".", "--dry-run"],
            cwd=project_root,
            shell=True 
        )
        
        sys.exit(result.returncode)
        
    except Exception as e:
        print(f"[!] Failed to trigger Bun diagnostic: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
