import os
import json
import re
import argparse
import logging
from logging_config import setup_logging

# Inicializa logging
setup_logging()
logger = logging.getLogger(__name__)

# Constants for i18n placeholders (could be moved to a separate file later)
STRINGS = {
    "scanning": "Escaneando diretórios em {dir}...",
    "dir_not_found": "Diretório não encontrado: {dir}",
    "error_parsing": "Erro ao processar {file}: {error}",
    "index_saved": "Índice salvo em {path}",
    "readme_saved": "README salvo em {path}",
    "index_not_found": "Índice não encontrado. Reconstruindo...",
    "no_agents_found": "Nenhum agente encontrado para a busca '{query}'.",
    "found_agents": "\nEncontrados {count} agentes para '{query}':\n"
}

def parse_persona_file(file_path):
    """Extrai metadados da persona a partir do conteúdo do arquivo."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        if not lines:
            return None
            
        first_line = lines[0].strip()
        
        # Regex para extrair Nome, Emoji e Papel. Formato esperado: You are "Name" <Emoji> - <Role>
        match = re.search(r'You are "(.*?)"\s*(.*?)\s*-\s*(.*)', first_line)
        
        name = match.group(1).strip() if match else "Unknown"
        emoji = match.group(2).strip() if match else "❓"
        role = match.group(3).strip() if match else "Unknown Role"
        
        # Busca a declaração da missão
        mission = "No mission defined."
        for line in lines:
            if "Your mission is" in line:
                mission = line.split("Your mission is")[-1].strip().strip('to ').strip(':').strip('.')
                break
                
        return {
            "name": name,
            "emoji": emoji,
            "role": role,
            "mission": mission,
            "file_path": file_path,
            "content": content
        }
    except Exception as e:
        logger.error(STRINGS["error_parsing"].format(file=file_path, error=e))
        return None

def rebuild_index(base_dir):
    """Reconstrói o arquivo index.json e o README.md do projeto."""
    directories = ["Flutter", "Kotlin"]
    index_data = []
    
    logger.info(STRINGS["scanning"].format(dir=base_dir))
    
    for d in directories:
        dir_path = os.path.join(base_dir, d)
        if not os.path.exists(dir_path):
            logger.warning(STRINGS["dir_not_found"].format(dir=dir_path))
            continue
            
        for filename in os.listdir(dir_path):
            if filename.endswith(".txt") and "todos_agentes" not in filename:
                file_path = os.path.join(dir_path, filename)
                try:
                    persona = parse_persona_file(file_path)
                    if persona:
                        persona["category"] = d
                        persona["relative_path"] = os.path.join(d, filename)
                        index_data.append(persona)
                except Exception as e:
                    logger.error(STRINGS["error_parsing"].format(file=filename, error=e))

    index_data.sort(key=lambda x: (x['category'], x['name']))

    # Salva o índice JSON
    json_path = os.path.join(base_dir, "index.json")
    try:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(index_data, f, indent=2, ensure_ascii=False)
        logger.info(STRINGS["index_saved"].format(path=json_path))
    except Exception as e:
        logger.error(f"Erro ao salvar index.json: {e}")

    # Gera o README.md
    readme_path = os.path.join(base_dir, "README.md")
    try:
        with open(readme_path, 'w', encoding='utf-8') as f:
            f.write("# 🏛️ Personas & Agents Index\n\n")
            f.write("Este índice é gerado automaticamente para facilitar a localização de especialistas.\n\n")
            
            current_category = ""
            for persona in index_data:
                if persona['category'] != current_category:
                    current_category = persona['category']
                    f.write(f"\n## 📦 {current_category} Specialists\n\n")
                    f.write("| Agent | Role | Mission | File |\n")
                    f.write("|-------|------|---------|------|\n")
                
                name_display = f"{persona['emoji']} **{persona['name']}**"
                mission_display = (persona['mission'][:97] + "...") if len(persona['mission']) > 100 else persona['mission']
                file_link = f"[{persona['name']}]({persona['relative_path'].replace(' ', '%20')})"
                
                f.write(f"| {name_display} | {persona['role']} | {mission_display} | {file_link} |\n")
        logger.info(STRINGS["readme_saved"].format(path=readme_path))
    except Exception as e:
        logger.error(f"Erro ao gerar README.md: {e}")
        
    return index_data

def search_index(query, base_dir):
    """Busca agentes no índice baseado em uma query."""
    json_path = os.path.join(base_dir, "index.json")
    
    if not os.path.exists(json_path):
        logger.info(STRINGS["index_not_found"])
        data = rebuild_index(base_dir)
    else:
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            logger.error(f"Erro ao ler índice: {e}")
            return
            
    query = query.lower()
    results = []
    
    for persona in data:
        score = 0
        score += 10 if query in persona['name'].lower() else 0
        score += 5 if query in persona['role'].lower() else 0
        score += 3 if query in persona.get('mission', '').lower() else 0
        score += 1 if query in persona.get('content', '').lower() else 0
            
        if score > 0:
            results.append((score, persona))
            
    results.sort(key=lambda x: x[0], reverse=True)
    
    if not results:
        logger.info(STRINGS["no_agents_found"].format(query=query))
        return

    print(STRINGS["found_agents"].format(count=len(results), query=query))
    print("-" * 70)
    for score, p in results[:15]:
        print(f"{p['emoji']}  {p['name']} ({p['category']})")
        print(f"    Role:    {p['role']}")
        print(f"    Mission: {p['mission']}")
        print("-" * 70)

def main():
    """Ponto de entrada da CLI para gerenciamento do índice."""
    parser = argparse.ArgumentParser(description="Gerenciador de Índice de Personas.")
    parser.add_argument("query", nargs="?", help="Termo de busca (ex: 'segurança')")
    parser.add_argument("--rebuild", action="store_true", help="Forçar reconstrução do índice")
    
    args = parser.parse_args()
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    if args.rebuild or not os.path.exists(os.path.join(base_dir, "index.json")):
        rebuild_index(base_dir)
        
    if args.query:
        search_index(args.query, base_dir)
    elif not args.rebuild:
        parser.print_help()

if __name__ == "__main__":
    main()
