import logging

logger = logging.getLogger(__name__)

class ParityAnalyst:
    """Assistente Técnico: Auditor de Simetria e Paridade de Stacks ⚖️"""
    
    def analyze_stack_gaps(self, personas: list) -> dict:
        """Mapeia ausências de PhDs entre as stacks Python, Flutter e Kotlin."""
        stats = {}
        for p in personas:
            if p.stack not in stats: 
                stats[p.stack] = {"telemetry": 0, "reasoning": 0, "modernity": 0, "agents": set()}
            
            m = p.get_maturity_metrics()
            stats[p.stack]["agents"].add(p.name)
            if m.get("has_telemetry"): stats[p.stack]["telemetry"] += 1
            if m.get("has_reasoning"): stats[p.stack]["reasoning"] += 1
            if m.get("has_pathlib"): stats[p.stack]["modernity"] += 1
        
        gaps = self._detect_gaps(stats)
        return {"stats": stats, "gaps": gaps}

    def _detect_gaps(self, stats):
        gaps = []
        python_agents = stats.get("Python", {}).get("agents", set())
        for stack in ["Flutter", "Kotlin"]:
            stack_agents = stats.get(stack, {}).get("agents", set())
            for agent in python_agents - stack_agents:
                gaps.append(f"GAP DE EXISTÊNCIA: O PhD {agent} está ausente na stack {stack}.")
        return gaps
