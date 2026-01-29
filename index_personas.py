import os
import json
import re
import argparse
import sys

def parse_persona_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    first_line = lines[0].strip()
    
    # regex to extract Name, Emoji, and Role/Description from the first line
    # Format usually: You are "Name" <Emoji> - <Role>
    match = re.search(r'You are "(.*?)"\s*(.*?)\s*-\s*(.*)', first_line)
    
    name = "Unknown"
    emoji = ""
    role = "Unknown"
    
    if match:
        name = match.group(1).strip()
        emoji = match.group(2).strip()
        role = match.group(3).strip()
    
    # Attempt to find the mission statement
    mission = ""
    for line in lines:
        if line.strip().startswith("Your mission is"):
            mission = line.strip().replace("Your mission is", "").strip()
            # Remove leading "to " if present
            if mission.startswith("to "):
                mission = mission[3:]
            # basic cleanup
            if mission.endswith(":") or mission.endswith("."):
                mission = mission[:-1]
            break
            
    return {
        "name": name,
        "emoji": emoji,
        "role": role,
        "mission": mission,
        "file_path": file_path,
        "content": content  # Store full content for search
    }

def rebuild_index(base_dir):
    directories = ["Flutter", "Kotlin"]
    index_data = []
    
    print(f"Scanning directories in {base_dir}...")
    
    for d in directories:
        dir_path = os.path.join(base_dir, d)
        if not os.path.exists(dir_path):
            print(f"Directory not found: {dir_path}")
            continue
            
        for filename in os.listdir(dir_path):
            if filename.endswith(".txt") and "todos_agentes" not in filename:
                file_path = os.path.join(dir_path, filename)
                relative_path = os.path.join(d, filename)
                
                try:
                    persona = parse_persona_file(file_path)
                    persona["category"] = d
                    persona["relative_path"] = relative_path
                    index_data.append(persona)
                except Exception as e:
                    print(f"Error parsing {filename}: {e}")

    # Sort by category then name
    index_data.sort(key=lambda x: (x['category'], x['name']))

    # Write JSON index
    json_path = os.path.join(base_dir, "index.json")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, indent=2, ensure_ascii=False)
    
    print(f"Index saved to {json_path}")
    
    # Write README.md
    readme_path = os.path.join(base_dir, "README.md")
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write("# Personas & Agents Index\n\n")
        f.write("This index is automatically generated to help you find the right specialist agent for your task.\n\n")
        
        current_category = ""
        for persona in index_data:
            if persona['category'] != current_category:
                current_category = persona['category']
                f.write(f"\n## {current_category} Specialists\n\n")
                f.write("| Agent | Role | Mission | File |\n")
                f.write("|-------|------|---------|------|\n")
            
            # format the row
            name_display = f"{persona['emoji']} **{persona['name']}**"
            mission_display = persona['mission'][:100] + "..." if len(persona['mission']) > 100 else persona['mission']
            file_link = f"[{persona['name']}]({persona['relative_path'].replace(' ', '%20')})"
            
            f.write(f"| {name_display} | {persona['role']} | {mission_display} | {file_link} |\n")

    print(f"README saved to {readme_path}")
    return index_data

def search_index(query, base_dir):
    json_path = os.path.join(base_dir, "index.json")
    
    if not os.path.exists(json_path):
        print("Index not found. Rebuilding...")
        data = rebuild_index(base_dir)
    else:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
    query = query.lower()
    results = []
    
    for persona in data:
        # Score relevance
        score = 0
        if query in persona['name'].lower():
            score += 10
        if query in persona['role'].lower():
            score += 5
        if query in persona.get('mission', '').lower():
            score += 3
        if query in persona.get('content', '').lower():
            score += 1
            
        if score > 0:
            results.append((score, persona))
            
    results.sort(key=lambda x: x[0], reverse=True)
    
    if not results:
        print(f"No agents found matching '{query}'.")
        return

    print(f"\nFound {len(results)} agents matching '{query}':\n")
    print("-" * 60)
    for score, p in results[:20]: # Show top 20
        print(f"{p['emoji']}  {p['name']} ({p['category']})")
        print(f"    Role:    {p['role']}")
        print(f"    Mission: {p['mission']}")
        print(f"    File:    {p['relative_path']}")
        print("-" * 60)

def main():
    parser = argparse.ArgumentParser(description="Manage and search Personas/Agents index.")
    parser.add_argument("query", nargs="?", help="Search query to find an agent (e.g., 'performance', 'security')")
    parser.add_argument("--rebuild", action="store_true", help="Force rebuild of the index")
    
    args = parser.parse_args()
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    if args.rebuild:
        rebuild_index(base_dir)
        
    if args.query:
        search_index(args.query, base_dir)
    elif not args.rebuild:
        # If no args, just rebuild if missing, or show help
        json_path = os.path.join(base_dir, "index.json")
        if not os.path.exists(json_path):
            rebuild_index(base_dir)
        else:
            parser.print_help()

if __name__ == "__main__":
    main()
