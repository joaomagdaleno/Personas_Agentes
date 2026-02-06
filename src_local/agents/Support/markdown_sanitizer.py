import re

class MarkdownSanitizer:
    def sanitize(self, content: str) -> str:
        if not content: return ""
        res, seen, in_cb = [], {}, False
        raw_lines = [line.rstrip() for line in content.split('\n')]
        
        for i, line in enumerate(raw_lines):
            stripped = line.strip()
            if stripped.startswith('```'):
                in_cb = not in_cb
                res.append(line)
                continue
            
            if in_cb:
                res.append(line)
                continue

            if re.match(r'^\#+\s+', stripped):
                # Padding Above
                if res and res[-1]: res.append('')
                # MD026 & MD024
                h = re.sub(r'[\.\!\?\:]+$', '', stripped)
                if h in seen:
                    seen[h] += 1
                    h = f"{h} [v{seen[h]}]"
                else: seen[h] = 1
                res.append(h)
                # Padding Below (will be handled by next line or collapse)
                if i < len(raw_lines)-1 and raw_lines[i+1].strip(): res.append('')
            elif stripped or (res and res[-1]):
                res.append(line)
                
        return '\n'.join(res).strip() + '\n'
