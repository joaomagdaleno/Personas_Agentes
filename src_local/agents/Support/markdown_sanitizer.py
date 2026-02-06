import re
import logging

logger = logging.getLogger(__name__)

class MarkdownSanitizer:
    """
    🏛️ Suporte de Sanitização PhD 3.0 (Context-Aware).
    Garante conformidade com as regras MD012, MD022, MD024 e MD026.
    """

    def sanitize(self, content: str) -> str:
        """Executa todas as passagens de sanitização."""
        if not content:
            return ""
            
        lines = self._normalize_and_collapse_lines(content)
        lines = self._sanitize_headings_and_uniqueness(lines)
        lines = self._ensure_heading_padding(lines)
        
        return '\n'.join(lines).strip() + '\n'

    def _normalize_and_collapse_lines(self, content: str) -> list:
        """Passagem 1: Normalização e Colapso de Linhas em Branco (MD012)"""
        raw_lines = [line.rstrip() for line in content.split('\n')]
        processed_lines = []
        in_code_block = False
        
        for line in raw_lines:
            if line.strip().startswith('```'):
                in_code_block = not in_code_block
                processed_lines.append(line)
                continue
            
            if in_code_block:
                processed_lines.append(line)
            else:
                if not line:
                    if processed_lines and processed_lines[-1]: # Collapse logic
                        processed_lines.append('')
                else:
                    processed_lines.append(line)
        return processed_lines

    def _sanitize_headings_and_uniqueness(self, lines: list) -> list:
        """Passagem 2: Sanitização de Cabeçalhos (MD026) e Unicidade (MD024)"""
        sanitized_lines = []
        seen_headings = {}
        in_code_block = False
        
        for line in lines:
            if line.strip().startswith('```'):
                in_code_block = not in_code_block
                sanitized_lines.append(line)
                continue
                
            # Um cabeçalho Markdown real começa com # e tem no máximo 3 espaços de indentação
            is_real_heading = not in_code_block and re.match(r'^[ ]{0,3}\#+\s+', line)
            
            if is_real_heading:
                # MD026: Remove pontuação final redundante
                line = re.sub(r'^(\#+\s+.*?)[\.\!\?\:]+$', r'\1', line)
                
                # MD024: Unique headings
                h_text = line.strip()
                if h_text in seen_headings:
                    seen_headings[h_text] += 1
                    line = f"{h_text} [v{seen_headings[h_text]}]"
                else:
                    seen_headings[h_text] = 1
            
            sanitized_lines.append(line)
        return sanitized_lines

    def _ensure_heading_padding(self, lines: list) -> list:
        """Passagem 3: Garantia de Preenchimento (MD022)"""
        final_lines = []
        in_code_block = False
        for i, line in enumerate(lines):
            if line.strip().startswith('```'):
                in_code_block = not in_code_block
                final_lines.append(line)
                continue
                
            is_heading = not in_code_block and re.match(r'^[ ]{0,3}\#+\s+', line)
            
            if is_heading:
                # Linha em branco ANTES
                if i > 0 and final_lines and final_lines[-1] != '':
                    final_lines.append('')
                
                final_lines.append(line)
                
                # Linha em branco DEPOIS
                if i < len(lines) - 1 and lines[i+1] != '':
                    final_lines.append('')
            else:
                final_lines.append(line)
        return final_lines
