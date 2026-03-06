use petgraph::algo::tarjan_scc;
use petgraph::graph::DiGraph;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct GraphRequest {
    pub files: HashMap<String, Vec<String>>, // file_path -> its dependencies
}

#[derive(Serialize)]
pub struct GraphResponse {
    pub nodes_count: usize,
    pub edges_count: usize,
    pub cycles: Vec<Vec<String>>,
    pub critical_nodes: Vec<CriticalNode>,
}

#[derive(Serialize)]
pub struct CriticalNode {
    pub path: String,
    pub dependents_count: usize, // Blast radius
}

pub fn analyze_graph(request: GraphRequest) -> GraphResponse {
    let mut graph = DiGraph::<String, ()>::new();
    let mut nodes = HashMap::new();

    // 1. Add all nodes
    for file_path in request.files.keys() {
        let idx = graph.add_node(file_path.clone());
        nodes.insert(file_path.clone(), idx);
    }

    // 2. Add edges
    for (file_path, deps) in &request.files {
        if let Some(&u) = nodes.get(file_path) {
            for dep in deps {
                if let Some(&v) = nodes.get(dep) {
                    graph.add_edge(u, v, ());
                }
            }
        }
    }

    // 3. Detect Cycles (Tarjan's strongly connected components)
    let scc = tarjan_scc(&graph);
    let cycles: Vec<Vec<String>> = scc.into_iter()
        .filter(|component| component.len() > 1)
        .map(|component| {
            component.into_iter()
                .map(|idx| graph[idx].clone())
                .collect()
        })
        .collect();

    // 4. Calculate Criticality (In-degree roughly represents blast radius for impact analysis)
    let mut critical_nodes: Vec<CriticalNode> = nodes.iter()
        .map(|(path, &idx)| {
            let dependents_count = graph.neighbors_directed(idx, petgraph::Direction::Incoming).count();
            CriticalNode {
                path: path.clone(),
                dependents_count,
            }
        })
        .collect();

    // Sort by dependents count descending
    critical_nodes.sort_by(|a, b| b.dependents_count.cmp(&a.dependents_count));
    critical_nodes.truncate(20); // Top 20 most coupled files

    GraphResponse {
        nodes_count: graph.node_count(),
        edges_count: graph.edge_count(),
        cycles,
        critical_nodes,
    }
}
