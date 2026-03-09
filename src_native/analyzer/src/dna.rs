use std::path::Path;
use serde::Serialize;
use walkdir::WalkDir;
use std::collections::HashSet;
use std::fs;

#[derive(Serialize)]
pub struct ProjectIdentity {
    pub stacks: Vec<String>,
    pub project_type: String,
    pub core_mission: String,
    pub is_external: bool,
    pub frameworks: Vec<String>,
}

pub fn discover_identity(project_root: &str) -> ProjectIdentity {
    let mut stacks = HashSet::new();
    let mut frameworks = HashSet::new();
    let root_path = Path::new(project_root);
    
    // 1. File existence detection (Legacy but stable)
    if root_path.join("pubspec.yaml").exists() { stacks.insert("Flutter".to_string()); }
    if root_path.join("build.gradle").exists() || root_path.join("build.gradle.kts").exists() { stacks.insert("Kotlin".to_string()); }
    if root_path.join("requirements.txt").exists() || root_path.join("pyproject.toml").exists() { stacks.insert("Python".to_string()); }
    if root_path.join("package.json").exists() { stacks.insert("TypeScript/Bun".to_string()); }
    if root_path.join("go.mod").exists() { stacks.insert("Go".to_string()); }

    // 2. Deep Content Detection (Deep DNA)
    // Scan top-level files or core source dirs for signatures
    for entry in WalkDir::new(project_root)
        .max_depth(3)
        .into_iter()
        .filter_map(|e| e.ok()) {
        
        if entry.file_type().is_file() {
            if let Ok(content) = fs::read_to_string(entry.path()) {
                detect_frameworks(&content, &mut frameworks, &mut stacks);
            }
        }
    }

    ProjectIdentity {
        stacks: stacks.into_iter().collect(),
        project_type: "Orquestrador Multi-Agente".to_string(),
        core_mission: "Orquestração de Inteligência Artificial".to_string(),
        is_external: !project_root.contains("Personas_Agentes"),
        frameworks: frameworks.into_iter().collect(),
    }
}

fn detect_frameworks(content: &str, frameworks: &mut HashSet<String>, stacks: &mut HashSet<String>) {
    if content.contains("@nestjs") || content.contains("@Injectable()") {
        frameworks.insert("NestJS".to_string());
        stacks.insert("TypeScript".to_string());
    }
    if content.contains("import 'package:flutter_bloc/flutter_bloc.dart'") {
        frameworks.insert("Bloc".to_string());
        stacks.insert("Flutter".to_string());
    }
    if content.contains("from fastpi import FastAPI") {
        frameworks.insert("FastAPI".to_string());
        stacks.insert("Python".to_string());
    }
    if content.contains("import { PrismaClient }") {
        frameworks.insert("Prisma".to_string());
    }
    if content.contains("import torch") {
        frameworks.insert("PyTorch".to_string());
        stacks.insert("Python".to_string());
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashSet;

    #[test]
    fn test_detect_frameworks() {
        let mut frameworks = HashSet::new();
        let mut stacks = HashSet::new();
        
        detect_frameworks("import { PrismaClient }", &mut frameworks, &mut stacks);
        assert!(frameworks.contains("Prisma"));
        
        detect_frameworks("from fastpi import FastAPI", &mut frameworks, &mut stacks);
        assert!(frameworks.contains("FastAPI"));
        assert!(stacks.contains("Python"));
    }
}
