use candle_core::{Device, Tensor};
use candle_transformers::generation::LogitsProcessor;
use candle_transformers::models::qwen2::{Config as Qwen2Config, Model as Qwen2Model};
use candle_nn::VarBuilder;
use tokenizers::Tokenizer;
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use serde::{Serialize, Deserialize};
use petgraph::graph::DiGraph;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum NodeType {
    File,
    Symbol,
    Module,
    Concept,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NodeData {
    pub id: String,
    pub node_type: NodeType,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum EdgeType {
    DependsOn,
    Calls,
    Extends,
    Contains,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EdgeData {
    pub edge_type: EdgeType,
    pub weight: f32,
}

#[derive(Serialize, Deserialize, Default)]
pub struct TfidfIndex {
    pub term_doc_freq: HashMap<String, u32>,
    pub num_docs: usize,
    pub vocabulary: Vec<String>,
    pub graph_nodes: Vec<NodeData>,
    pub graph_edges: Vec<(String, String, EdgeData)>, // (source_id, target_id, data)
    pub file_mtimes: HashMap<String, u64>,
}

#[derive(Serialize, Deserialize)]
pub struct ReasoningTemplate {
    pub keywords: Vec<String>,
    pub response: String,
}

pub enum LlmModel {
    Qwen2(Qwen2Model),
}

pub struct Brain {
    tfidf: TfidfIndex,
    index_path: PathBuf,
    templates: Vec<ReasoningTemplate>,
    graph: DiGraph<NodeData, EdgeData>,
    node_map: HashMap<String, petgraph::graph::NodeIndex>,
    // Camada Generativa (Lazy)
    llm: Option<LlmModel>,
    tokenizer: Option<Tokenizer>,
    device: Device,
}

impl Brain {
    pub fn new() -> Option<Self> {
        let index_path = std::path::PathBuf::from("../../.gemini/brain.bin");
        let device = match Device::new_cuda(0) {
            Ok(d) => d,
            Err(_) => Device::Cpu,
        };

        let mut brain = Self {
            tfidf: TfidfIndex::default(),
            index_path: index_path.clone(),
            templates: Vec::new(),
            graph: DiGraph::new(),
            node_map: HashMap::new(),
            llm: None,
            tokenizer: None,
            device,
        };

        if index_path.exists() {
            if let Ok(data) = std::fs::read(&index_path) {
                if let Ok(index) = bincode::deserialize::<TfidfIndex>(&data) {
                    brain.tfidf = index;
                    // Rebuild petgraph from flat memory
                    for node in &brain.tfidf.graph_nodes {
                        let idx = brain.graph.add_node(node.clone());
                        brain.node_map.insert(node.id.clone(), idx);
                    }
                    for (u_id, v_id, edge) in &brain.tfidf.graph_edges {
                        if let (Some(&u), Some(&v)) = (brain.node_map.get(u_id), brain.node_map.get(v_id)) {
                            brain.graph.add_edge(u, v, edge.clone());
                        }
                    }
                }
            }
        }

        brain.templates = vec![
            ReasoningTemplate {
                keywords: vec!["o que faz".to_string(), "brain".to_string()],
                response: "🧠 [Reasoning Soberano]: O Sovereign Brain é o núcleo de inteligência do sistema, combinando Busca Semântica (TF-IDF), Grafo de Conhecimento (petgraph) e uma Camada Generativa local (Qwen 2.5).".to_string(),
            },
            ReasoningTemplate {
                keywords: vec!["auditoria".to_string(), "segurança".to_string()],
                response: "🛡️ [Auditoria Soberana]: Recomendado verificar as permissões de acesso, sanitização de inputs e o uso de `unsafe` blocks no código Rust para garantir a soberania e segurança.".to_string(),
            },
            ReasoningTemplate {
                keywords: vec!["performance".to_string(), "lento".to_string()],
                response: "⚡ [Dica de Performance]: Para sistemas com 8GB de RAM, recomendo usar o cache em bincode e evitar o carregamento simultâneo de múltiplos modelos grandes. O BF16/F16 pode ajudar a reduzir o uso de memória.".to_string(),
            },
        ];

        Some(brain)
    }

    fn ensure_llm(&mut self) -> bool {
        if self.llm.is_some() { return true; }
 
        eprintln!("⌛ [Brain] Carregando Qwen 2.5 Coder 0.5B (Manual Safetensors)...");
        let mut model_dir = PathBuf::from(".gemini/models/qwen2.5-coder-0.5b");
        if !model_dir.exists() {
            model_dir = PathBuf::from("../.gemini/models/qwen2.5-coder-0.5b");
        }
        if !model_dir.exists() {
            model_dir = PathBuf::from("../../.gemini/models/qwen2.5-coder-0.5b");
        }
        
        let tokenizer_path = model_dir.join("tokenizer.json");
        let config_path = model_dir.join("config.json");
        let model_path = model_dir.join("model.safetensors");

        if !config_path.exists() || !model_path.exists() || !tokenizer_path.exists() {
            eprintln!("❌ Arquivos do modelo incompletos em {:?}", model_dir);
            return false;
        }

        let config_str = std::fs::read_to_string(&config_path).unwrap_or_default();
        let cfg: Qwen2Config = match serde_json::from_str(&config_str) {
            Ok(c) => c,
            Err(e) => { eprintln!("❌ Erro no config.json: {:?}", e); return false; }
        };

        // Carregamento nativo via candle_core (mais simples e evita erros de tipo)
        eprintln!("⌛ [Brain] Lendo model.safetensors...");
        let tensors = match candle_core::safetensors::load(&model_path, &self.device) {
            Ok(t) => t,
            Err(e) => {
                eprintln!("❌ Erro ao carregar model.safetensors: {:?}", e);
                return false;
            }
        };

        // Correção de Namespace e Tied Weights (Qwen 2.5 Coder 0.5B)
        let mut final_tensors = HashMap::new();
        for (name, tensor) in tensors {
            let new_name = if name.starts_with("model.") {
                name["model.".len()..].to_string()
            } else {
                name.clone()
            };
            final_tensors.insert(new_name, tensor);
        }

        // Se lm_head.weight não existe, usamos os pesos de embedding (weights tying)
        if !final_tensors.contains_key("lm_head.weight") {
            if let Some(embed) = final_tensors.get("embed_tokens.weight") {
                final_tensors.insert("lm_head.weight".to_string(), embed.clone());
            }
        }

        eprintln!("✅ Tensores processados ({} pesos mapeados).", final_tensors.len());

        let vb = VarBuilder::from_tensors(final_tensors, candle_core::DType::F32, &self.device); // Mantendo F32 para CPU compat
        eprintln!("✅ VarBuilder pronto.");
        use std::io::Write;
        std::io::stderr().flush().ok();

        let model = match Qwen2Model::new(&cfg, vb) {
            Ok(m) => m,
            Err(e) => {
                eprintln!("❌ Erro ao instanciar Qwen2: {:?}", e);
                return false;
            }
        };
        eprintln!("✅ Grafo Qwen2 instanciado.");
        std::io::stderr().flush().ok();

        let tokenizer = match Tokenizer::from_file(&tokenizer_path) {
            Ok(t) => t,
            Err(e) => { eprintln!("❌ Erro no tokenizer: {:?}", e); return false; }
        };

        self.llm = Some(LlmModel::Qwen2(model));
        self.tokenizer = Some(tokenizer);
        eprintln!("🚀 [Brain] Camada Generativa Qwen2 (Safetensors Manual) pronta.");
        true
    }

    pub fn train(&mut self, files: &HashMap<String, String>, mtimes: &HashMap<String, u64>) {
        // Incremental check: if number of files and ALL mtimes match, skip training
        if files.len() == self.tfidf.num_docs && !mtimes.is_empty() {
            let mut all_match = true;
            for (path, mtime) in mtimes {
                if self.tfidf.file_mtimes.get(path) != Some(mtime) {
                    all_match = false;
                    break;
                }
            }
            if all_match {
                eprintln!("✨ [Brain] Sinronizado (sem alterações detectadas).");
                return;
            }
        }

        eprintln!("🧠 [Brain] Indexando {} arquivos...", files.len());
        
        let mut df = HashMap::new();
        let num_docs = files.len();

        for content in files.values() {
            let terms = self.tokenize(content);
            let unique_terms: HashSet<_> = terms.into_iter().collect();
            for term in unique_terms {
                *df.entry(term).or_insert(0) += 1;
            }
        }

        let mut vocab_pairs: Vec<_> = df.iter().collect();
        vocab_pairs.sort_by(|a, b| b.1.cmp(a.1));
        let vocabulary: Vec<String> = vocab_pairs.into_iter()
            .take(1024)
            .map(|(k, _)| k.clone())
            .collect();

        let (nodes, edges) = self.build_graph_data(files);
        self.tfidf = TfidfIndex {
            term_doc_freq: df,
            num_docs,
            vocabulary,
            graph_nodes: nodes.values().cloned().collect(),
            graph_edges: edges,
            file_mtimes: mtimes.clone(),
        };

        // Populate petgraph for in-memory use
        self.graph.clear();
        self.node_map.clear();
        for node in &self.tfidf.graph_nodes {
            let idx = self.graph.add_node(node.clone());
            self.node_map.insert(node.id.clone(), idx);
        }
        for (u_id, v_id, edge) in &self.tfidf.graph_edges {
            if let (Some(&u), Some(&v)) = (self.node_map.get(u_id), self.node_map.get(v_id)) {
                self.graph.add_edge(u, v, edge.clone());
            }
        }

        self.save();
    }

    fn build_graph_data(&self, files: &HashMap<String, String>) -> (HashMap<String, NodeData>, Vec<(String, String, EdgeData)>) {
        let mut nodes = HashMap::new();
        let mut edges = Vec::new();
        let mut stem_to_path = HashMap::new();
        let mut symbol_to_path: HashMap<String, Vec<String>> = HashMap::new();
        let mut file_deps = HashMap::new();

        // Pass 1: Create File Nodes and collect metadata
        for (path, content) in files {
            let stem = Path::new(path).file_stem().map_or("".to_string(), |s| s.to_string_lossy().into_owned());
            stem_to_path.insert(stem, path.clone());
            
            nodes.insert(path.clone(), NodeData {
                id: path.clone(),
                node_type: NodeType::File,
                metadata: HashMap::new(),
            });

            let ext = Path::new(path).extension().and_then(|s| s.to_str()).unwrap_or("");
            let deps = crate::dependencies::extract_dependencies(content, ext);
            
            // Pass 1.1: Create Symbol Nodes and link to File (Contains)
            for symbol in &deps.defined_symbols {
                let symbol_id = format!("{}::{}", path, symbol);
                nodes.insert(symbol_id.clone(), NodeData {
                    id: symbol_id.clone(),
                    node_type: NodeType::Symbol,
                    metadata: [("name".to_string(), symbol.clone())].into_iter().collect(),
                });
                
                // File Contains Symbol
                edges.push((path.clone(), symbol_id.clone(), EdgeData { edge_type: EdgeType::Contains, weight: 1.0 }));
                
                symbol_to_path.entry(symbol.clone()).or_insert_with(Vec::new).push(path.clone());
            }

            file_deps.insert(path.clone(), deps);
        }

        // Pass 2: Resolve edges based on AST (Imports and precise Calls)
        for (path, deps) in &file_deps {
            let mut seen_targets = HashSet::new();

            // 1. Resolve Imports (DependsOn)
            for imp in &deps.imports {
                let imp_stem = Path::new(imp).file_stem().map_or_else(|| imp.clone(), |s| s.to_string_lossy().to_string());
                if let Some(target_file) = stem_to_path.get(&imp_stem) {
                    if target_file != path && seen_targets.insert(target_file.clone()) {
                        edges.push((path.clone(), target_file.clone(), EdgeData { edge_type: EdgeType::DependsOn, weight: 1.0 }));
                    }
                }
            }

            // 2. Resolve Precise Calls (Calls)
            // If a file calls a symbol defined elsewhere, link those files (or symbols if we want deeper)
            for call in &deps.calls {
                if let Some(target_files) = symbol_to_path.get(call) {
                    for target_file in target_files {
                        if target_file != path && !seen_targets.contains(target_file) {
                             // Deep linking: current_file -> target_file::symbol
                             let target_symbol_id = format!("{}::{}", target_file, call);
                             edges.push((path.clone(), target_symbol_id, EdgeData { edge_type: EdgeType::Calls, weight: 0.8 }));
                             seen_targets.insert(target_file.clone());
                        }
                    }
                }
            }
        }
        (nodes, edges)
    }

    fn prune_vocabulary(&mut self) {
        let max_vocab = 5000;
        
        // Quick estimate check
        if self.tfidf.vocabulary.len() <= max_vocab && self.tfidf.term_doc_freq.len() < 20000 {
            return;
        }

        eprintln!("[Brain] Pruning vocabulary (Current: {} terms)...", self.tfidf.term_doc_freq.len());
        
        let mut pairs: Vec<_> = self.tfidf.term_doc_freq.iter().collect();
        // Keep terms with higher document frequency (more systematic)
        pairs.sort_by(|a, b| b.1.cmp(a.1));
        
        if pairs.len() > max_vocab {
            let threshold = pairs[max_vocab].1;
            self.tfidf.term_doc_freq.retain(|_, &mut count| count >= threshold);
            self.tfidf.vocabulary.truncate(max_vocab);
        }
        
        eprintln!("[Brain] Vocabulary pruned to {} terms.", self.tfidf.term_doc_freq.len());
    }

    fn save(&self) {
        if let Ok(data) = bincode::serialize(&self.tfidf) {
            let _ = std::fs::create_dir_all(".gemini");
            let _ = std::fs::write(&self.index_path, data);
        }
    }

    pub fn tokenize(&self, text: &str) -> Vec<String> {
        text.split(|c: char| !c.is_alphanumeric() && c != '_')
            .filter(|s| s.len() > 3)
            .map(|s| s.to_lowercase())
            .collect()
    }

    pub fn embed(&self, text: &str) -> Option<Vec<f32>> {
        if self.tfidf.num_docs == 0 { return None; }
        let terms = self.tokenize(text);
        let mut tf = HashMap::new();
        for term in &terms { *tf.entry(term).or_insert(0) += 1; }

        let mut vector = vec![0.0; self.tfidf.vocabulary.len()];
        let num_docs = self.tfidf.num_docs as f32;

        for (i, vocab_term) in self.tfidf.vocabulary.iter().enumerate() {
            if let Some(&count) = tf.get(vocab_term) {
                let term_tf = count as f32 / terms.len() as f32;
                let term_df = *self.tfidf.term_doc_freq.get(vocab_term).unwrap_or(&1) as f32;
                let idf = (num_docs / (1.0 + term_df)).ln();
                vector[i] = term_tf * idf;
            }
        }
        Some(vector)
    }

    pub fn retrieve_context(&self, query: &str) -> String {
        let mut context_parts = Vec::new();
        let query_terms = self.tokenize(query);

        // 1. Semantic Retrieval (TF-IDF based)
        let mut scores = Vec::new();
        for node in &self.tfidf.graph_nodes {
            if node.node_type == NodeType::File {
                let mut score = 0.0;
                let id_lower = node.id.to_lowercase();
                
                // Boost for exact matches in path
                for term in &query_terms {
                    if id_lower.contains(term) {
                        score += 0.5;
                    }
                }
                
                if score > 0.0 {
                    scores.push((node.id.clone(), score));
                }
            }
        }
        
        scores.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        scores.truncate(3);

        for (path_str, _) in scores {
            context_parts.push(format!("### Relevant File: {}\n", path_str));
            // Add a snippet of the file content if possible
            if let Ok(content) = std::fs::read_to_string(&path_str) {
                let snippet: String = content.lines().take(20).collect::<Vec<_>>().join("\n");
                context_parts.push(format!("Code Snippet:\n```\n{}...\n```\n", snippet));
            }

            let deps = self.get_context_for(&path_str);
            if !deps.is_empty() {
                context_parts.push(format!("Architecture Context for {}:\n- {}\n", path_str, deps.join("\n- ")));
            }
        }

        if context_parts.is_empty() {
            "No specific context found in the knowledge graph for this query.".to_string()
        } else {
            context_parts.join("\n")
        }
    }

    pub fn reason(&mut self, prompt: &str, context: Option<&str>, max_tokens: usize) -> Option<String> {
        // Camada 2: Templates Rápidos (Pattern Matching Soberano)
        let p = prompt.to_lowercase();
        if context.is_none() { // Solo checar templates se for query pura (evita conflitos de contexto)
            for template in &self.templates {
                if template.keywords.iter().all(|k| p.contains(k)) {
                    return Some(template.response.clone());
                }
            }
        }

        let context_str = context.unwrap_or("No additional context provided.");

        // Camada 3: Generativa (Qwen 2.5 Coder)
        if !self.ensure_llm() { 
            return Some(format!(
                "⚠️ [RAG retrieval succeeded, but generative layer is unavailable]\n\nCONTEXT RETRIEVED:\n{}\n\nNOTE: To enable AI-generated responses, please place the Qwen 2.5 Coder weights in '.gemini/models/qwen2.5-coder-0.5b/'.",
                context_str
            )); 
        }

        let tokenizer = self.tokenizer.as_ref().unwrap();

        // Qwen 2.5 Coder Instruct Chat Template with Context Injection
        let chat_prompt = format!(
            "<|im_start|>system\nYou are a helpful code assistant. Use the following context to answer the user query concisely in the same language as the user.\n\nCONTEXT:\n{}\n<|im_end|>\n<|im_start|>user\n{}<|im_end|>\n<|im_start|>assistant\n",
            context_str,
            prompt
        );

        let enc = tokenizer.encode(chat_prompt.as_str(), true).ok()?;
        let mut tokens = enc.get_ids().to_vec();
        let mut generated = String::new();
        let mut logits_processor = LogitsProcessor::new(42, Some(0.7), None);

        eprintln!("📝 Prompt formatado ({} chars). Gerando...", chat_prompt.len());
        for i in 0..max_tokens {
            let (input, index_pos) = if i == 0 {
                (Tensor::new(tokens.as_slice(), &self.device).ok()?.unsqueeze(0).ok()?, 0)
            } else {
                let last_token = *tokens.last().unwrap();
                (Tensor::new(&[last_token], &self.device).ok()?.unsqueeze(0).ok()?, tokens.len() - 1)
            };

            let logits = match self.llm.as_mut().unwrap() {
                LlmModel::Qwen2(m) => m.forward(&input, index_pos).ok()?,
            };

            let logits = logits.squeeze(0).ok()?;
            let logits = if logits.dims().len() > 1 {
                let seq_len = logits.dim(0).ok()?;
                logits.narrow(0, seq_len - 1, 1).ok()?.squeeze(0).ok()?
            } else {
                logits
            };
            
            let next_token = logits_processor.sample(&logits).ok()?;
            if i % 10 == 0 { eprint!(" [#{}:{}] ", i, next_token); }
            tokens.push(next_token);

            if next_token == 151643 || next_token == 151645 { 
                eprintln!(" [EOS] ");
                break; 
            }

            let word = tokenizer.decode(&[next_token], true).ok()?;
            generated.push_str(&word);
            eprint!("{}", word);
        }
        eprintln!();

        Some(generated)
    }

    pub fn get_context_for(&self, file_path: &str) -> Vec<String> {
        let mut context = Vec::new();

        if let Some(&u) = self.node_map.get(file_path) {
            // Outgoing neighbors (Dependencies)
            for v in self.graph.neighbors(u) {
                context.push(format!("Depends on: {}", self.graph[v].id));
            }
            // Incoming neighbors (Dependents)
            for v in self.graph.neighbors_directed(u, petgraph::Direction::Incoming) {
                context.push(format!("Required by: {}", self.graph[v].id));
            }
        }
        context
    }

    pub fn get_graph_json(&self, focus_path: &str, _depth: i32) -> String {
        // Return a subgraph centered on focus_path
        let mut subgraph_nodes = HashSet::new();
        if let Some(&u) = self.node_map.get(focus_path) {
            subgraph_nodes.insert(u);
            // Simple depth-1 for now, can expand later
            for v in self.graph.neighbors(u) { subgraph_nodes.insert(v); }
            for v in self.graph.neighbors_directed(u, petgraph::Direction::Incoming) { subgraph_nodes.insert(v); }
        } else {
            // Return all if no focus
            for idx in self.graph.node_indices() { subgraph_nodes.insert(idx); }
        }

        let nodes: Vec<_> = subgraph_nodes.iter().map(|&idx| &self.graph[idx]).collect();
        let mut edges = Vec::new();
        for &u in &subgraph_nodes {
            for v in self.graph.neighbors(u) {
                if subgraph_nodes.contains(&v) {
                    if let Some(edge_idx) = self.graph.find_edge(u, v) {
                        edges.push((&self.graph[u].id, &self.graph[v].id, &self.graph[edge_idx]));
                    }
                }
            }
        }

        serde_json::to_string(&serde_json::json!({
            "nodes": nodes,
            "edges": edges
        })).unwrap_or_else(|_| "{}".to_string())
    }

    pub fn query_graph(&self, query: &str) -> String {
        // Simple filter by ID/Metadata for now
        let nodes: Vec<_> = self.graph.node_indices()
            .map(|idx| &self.graph[idx])
            .filter(|node| node.id.contains(query))
            .collect();
        
        serde_json::to_string(&nodes).unwrap_or_else(|_| "[]".to_string())
    }

    pub fn is_trained(&self) -> bool { self.tfidf.num_docs > 0 }
    #[allow(dead_code)]
    pub fn is_loaded(&self) -> bool { true }
}
