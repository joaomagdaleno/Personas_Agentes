
import asyncio
from typing import List, Dict, Any, Optional
from abc import ABC, abstractmethod

class ProjectContext:
    def __init__(self, map: Optional[Dict[str, Any]] = None, hub: Any = None):
        self.map = map or {}
        self.hub = hub

class AuditFinding:
    def __init__(self, file: str, line: int, issue: str, severity: str):
        self.file = file
        self.line = line
        self.issue = issue
        self.severity = severity

class StrategicFinding:
    def __init__(self, file: str, issue: str, severity: str, context: str):
        self.file = file
        self.issue = issue
        self.severity = severity
        self.context = context

class BaseActivePersona(ABC):
    def __init__(self, project_root: Optional[str] = None):
        self.id = "base_agent"
        self.name = "Base"
        self.emoji = "👤"
        self.role = "Generalist"
        self.stack = "Universal"
        self.project_root = project_root
        self.context_data = {}
        self.hub = None

    def set_context(self, context: ProjectContext):
        self.context_data = context.map
        self.hub = context.hub

    async def delegate_audit_to_hub(self, file_rel_path: str) -> List[Dict[str, Any]]:
        if not self.hub:
            return []
        
        content = ""
        if file_rel_path in self.context_data:
            content = self.context_data[file_rel_path].get("content", "")
        
        if not content:
            # In a real scenario, read from disk
            pass

        if not content:
            return []

        # This assumes self.hub is a gRPC client similar to the TS one
        try:
            return await self.hub.analyze_code(content, self.id, self.stack)
        except Exception as e:
            print(f"❌ Error delegating to Hub: {e}")
            return []

    @abstractmethod
    def get_audit_rules(self) -> Dict[str, Any]:
        return {}

    @abstractmethod
    async def perform_audit(self) -> List[Any]:
        return []
