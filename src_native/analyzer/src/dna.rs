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
            let path = entry.path();
            if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
                if let Ok(content) = fs::read_to_string(path) {
                    let deps = crate::dependencies::extract_dependencies(&content, ext);
                    detect_frameworks_from_ast(&deps, ext, &mut frameworks, &mut stacks);
                }
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

fn detect_frameworks_from_ast(deps: &crate::dependencies::DependencyInfo, ext: &str, frameworks: &mut HashSet<String>, stacks: &mut HashSet<String>) {
    for import in &deps.imports {
        let imp_lower = import.to_lowercase();
        
        if imp_lower.contains("nestjs") || imp_lower.contains("@nestjs") {
            frameworks.insert("NestJS".to_string());
            stacks.insert("TypeScript".to_string());
        }
        if imp_lower.contains("flutter_bloc") {
            frameworks.insert("Bloc".to_string());
            stacks.insert("Flutter".to_string());
        }
        if imp_lower.contains("fastapi") {
            frameworks.insert("FastAPI".to_string());
            stacks.insert("Python".to_string());
        }
        if imp_lower.contains("@prisma/client") || imp_lower.contains("prisma") {
            frameworks.insert("Prisma".to_string());
            if ext == "ts" || ext == "js" { stacks.insert("TypeScript".to_string()); }
            if ext == "rs" { stacks.insert("Rust".to_string()); }
            if ext == "py" { stacks.insert("Python".to_string()); }
            if ext == "go" { stacks.insert("Go".to_string()); }
        }
        if imp_lower == "torch" {
            frameworks.insert("PyTorch".to_string());
            stacks.insert("Python".to_string());
        }
    }
    
    // Fallback for decorators that might be caught in defined_symbols or calls depending on parser structure
    for call in &deps.calls {
        if call == "Injectable" || call == "Controller" || call == "Module" {
            frameworks.insert("NestJS".to_string());
            stacks.insert("TypeScript".to_string());
        }
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
        
        let deps1 = crate::dependencies::extract_dependencies("import { PrismaClient } from '@prisma/client'", "ts");
        detect_frameworks_from_ast(&deps1, "ts", &mut frameworks, &mut stacks);
        assert!(frameworks.contains("Prisma"));
        
        let deps2 = crate::dependencies::extract_dependencies("from fastapi import FastAPI", "py");
        detect_frameworks_from_ast(&deps2, "py", &mut frameworks, &mut stacks);
        assert!(frameworks.contains("FastAPI"));
        assert!(stacks.contains("Python"));
    }
}
