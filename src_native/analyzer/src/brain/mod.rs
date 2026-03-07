use candle_core::{Device, Tensor};
use candle_transformers::generation::LogitsProcessor;
use candle_transformers::models::qwen2::{Config as Qwen2Config, Model as Qwen2Model};
use candle_nn::VarBuilder;
use tokenizers::Tokenizer;
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use serde::{Serialize, Deserialize};
use petgraph::graph::DiGraph;

#[derive(Serialize, Deserialize, Default)]
pub struct TfidfIndex {
    pub term_doc_freq: HashMap<String, u32>,
    pub num_docs: usize,
    pub vocabulary: Vec<String>,
    pub graph_data: HashMap<String, Vec<String>>, // Adjacency list: file_path -> its dependencies
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
    graph_path: PathBuf,
    templates: Vec<ReasoningTemplate>,
    graph: DiGraph<String, ()>,
    // Camada Generativa (Lazy)
    llm: Option<LlmModel>,
    tokenizer: Option<Tokenizer>,
    device: Device,
}

impl Brain {
    pub fn new() -> Option<Self> {
        let index_path = PathBuf::from(".gemini/brain_index.bin");
        let graph_path = PathBuf::from(".gemini/brain_graph.bin");
        let device = Device::Cpu;
        
        let mut brain = Self {
            tfidf: TfidfIndex::default(),
            index_path: index_path.clone(),
            graph_path,
            templates: Vec::new(),
            graph: DiGraph::new(),
            llm: None,
            tokenizer: None,
            device,
        };

        if index_path.exists() {
            if let Ok(data) = std::fs::read(&index_path) {
                if let Ok(index) = bincode::deserialize::<TfidfIndex>(&data) {
                    brain.tfidf = index;
                    // Rebuild petgraph from adjacency list
                    let mut nodes = HashMap::new();
                    for (file, deps) in &brain.tfidf.graph_data {
                        let u = *nodes.entry(file.clone()).or_insert_with(|| brain.graph.add_node(file.clone()));
                        for dep in deps {
                            let v = *nodes.entry(dep.clone()).or_insert_with(|| brain.graph.add_node(dep.clone()));
                            brain.graph.add_edge(u, v, ());
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

    pub fn train(&mut self, files: &HashMap<String, String>) {
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

        self.tfidf = TfidfIndex {
            term_doc_freq: df,
            num_docs,
            vocabulary,
            graph_data: self.build_graph_data(files),
        };

        // Populate petgraph for in-memory use
        self.graph.clear();
        let mut nodes = HashMap::new();
        for (file, deps) in &self.tfidf.graph_data {
            let u = *nodes.entry(file.clone()).or_insert_with(|| self.graph.add_node(file.clone()));
            for dep in deps {
                let v = *nodes.entry(dep.clone()).or_insert_with(|| self.graph.add_node(dep.clone()));
                self.graph.add_edge(u, v, ());
            }
        }

        self.save();
    }

    fn build_graph_data(&self, files: &HashMap<String, String>) -> HashMap<String, Vec<String>> {
        let mut graph_data = HashMap::new();
        let file_names: HashSet<String> = files.keys().map(|k| Path::new(k).file_stem().map_or("".to_string(), |s| s.to_string_lossy().to_string())).collect();

        for (path, content) in files {
            let mut deps = Vec::new();
            // Simple generic dependency detection (regex for imports/uses)
            let re_rust = regex::Regex::new(r"(?m)^use\s+([^;:]+)").unwrap();
            let re_ts = regex::Regex::new(r#"import\s+.*\s+from\s+['"]([^'"]+)['"]"#).unwrap();
            let re_py = regex::Regex::new(r"(?m)^(?:import|from)\s+([^\s\.]+)").unwrap();

            for cap in re_rust.captures_iter(content) {
                let dep = cap[1].trim().to_string();
                if file_names.contains(&dep) { deps.push(dep); }
            }
            for cap in re_ts.captures_iter(content) {
                let dep = cap[1].trim().to_string();
                if file_names.contains(&dep) { deps.push(dep); }
            }
            for cap in re_py.captures_iter(content) {
                let dep = cap[1].trim().to_string();
                if file_names.contains(&dep) { deps.push(dep); }
            }
            graph_data.insert(path.clone(), deps);
        }
        graph_data
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

    pub fn reason(&mut self, prompt: &str, max_tokens: usize) -> Option<String> {
        // Camada 2: Templates Rápidos (Pattern Matching Soberano)
        let p = prompt.to_lowercase();
        for template in &self.templates {
            if template.keywords.iter().all(|k| p.contains(k)) {
                return Some(template.response.clone());
            }
        }

        // Camada 3: Generativa (Qwen 2.5 Coder)
        if !self.ensure_llm() { return Some("❌ Falha ao carregar Qwen 2.5 Coder.".to_string()); }

        let tokenizer = self.tokenizer.as_ref().unwrap();
        
        // Qwen 2.5 Coder Instruct Chat Template
        let chat_prompt = format!(
            "<|im_start|>system\nYou are a helpful code assistant. Respond concisely in the same language as the user.<|im_end|>\n<|im_start|>user\n{}<|im_end|>\n<|im_start|>assistant\n",
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
        let mut nodes = HashMap::new();
        // Temporarily rebuild node map for lookup
        for idx in self.graph.node_indices() {
            nodes.insert(self.graph[idx].clone(), idx);
        }

        if let Some(&u) = nodes.get(file_path) {
            // Outgoing neighbors (Dependencies)
            for v in self.graph.neighbors(u) {
                context.push(format!("Depends on: {}", self.graph[v]));
            }
            // Incoming neighbors (Dependents)
            for v in self.graph.neighbors_directed(u, petgraph::Direction::Incoming) {
                context.push(format!("Required by: {}", self.graph[v]));
            }
        }
        context
    }

    pub fn is_trained(&self) -> bool { self.tfidf.num_docs > 0 }
    pub fn is_loaded(&self) -> bool { true }
}
