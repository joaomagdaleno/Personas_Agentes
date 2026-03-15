import { useState, useEffect, useRef } from 'react';
import { extractSection, parseTable } from './utils/md_parser';

interface Persona {
  id: string;
  name: string;
  emoji: string;
  role: string;
  phd_identity?: string;
}

interface ProcessInfo {
  name: string;
  pid: number;
  mem_mb: number;
  cpu_percent: number;
}

interface Metrics {
  cpu_usage: number;
  memory_usage: number;
  goroutines: number;
  heavy_processes: ProcessInfo[];
  timestamp: string;
}

interface MemoryResponse {
  id: string;
  objective: string;
  action: string;
  result: string;
  timestamp: string;
  score: number;
}

interface Task {
  id: number;
  task_type: string;
  target_file: string;
  status: string;
  result?: string;
  created_at: string;
}

interface Event {
  type: string;
  sender_id?: string;
  signal_type?: string;
  payload_json?: string;
  message?: string;
  timestamp: string;
  metrics?: Metrics;
}

type Screen = 'fleet' | 'governance' | 'intelligence';

const HUB_URL = "http://localhost:8080";

function App() {
  const [agents, setAgents] = useState<Persona[]>([]);
  const [thoughts, setThoughts] = useState<Event[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ cpu_usage: 0, memory_usage: 0, goroutines: 0, heavy_processes: [], timestamp: '' });
  const [connected, setConnected] = useState(false);
  const [stability, setStability] = useState(100);
  const [screen, setScreen] = useState<Screen>('fleet');
  const [govContent, setGovContent] = useState<string>('');
  const [docList, setDocList] = useState<string[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string>('walkthrough.md');
  
  // Intelligence State
  const [memorySearch, setMemorySearch] = useState('');
  const [memories, setMemories] = useState<MemoryResponse[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const thoughtStreamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eventSource = new EventSource(`${HUB_URL}/events`);

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'HEALTH_UPDATE') {
          setMetrics(data.metrics);
        } else if (data.type === 'HEALTH_ALERT') {
          setStability((prev) => Math.max(0, prev - 5));
          setThoughts((prev) => [data, ...prev].slice(0, 50));
        } else {
          setThoughts((prev) => [data, ...prev].slice(0, 50));
        }
      } catch (err) {
        console.error("Failed to parse event:", err);
      }
    };

    eventSource.onerror = (e) => {
      console.error("SSE Error:", e);
      setConnected(false);
    };

    return () => eventSource.close();
  }, []);

  // Fetch census data from Hub
  useEffect(() => {
    fetch(`${HUB_URL}/census`)
      .then(res => res.json())
      .then(data => setAgents(data.personas || []))
      .catch(err => console.error('Failed to fetch census:', err));
  }, []);

  useEffect(() => {
    if (screen === 'governance') {
      // Fetch document list first
      fetch(`${HUB_URL}/governance/list`)
        .then(res => res.json())
        .then(data => setDocList(data.documents || []))
        .catch(err => console.error("Failed to fetch doc list:", err));

      // Fetch initial or selected doc
      fetch(`${HUB_URL}/governance?file=${selectedDoc}`)
        .then(res => res.json())
        .then(data => setGovContent(data.content))
        .catch(err => console.error("Failed to fetch governance:", err));
    }
  }, [screen, selectedDoc]);

  // Slowly recover stability
  useEffect(() => {
    const timer = setInterval(() => {
      setStability((prev) => Math.min(100, prev + 1));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Intelligence data fetching
  useEffect(() => {
    if (screen === 'intelligence') {
      fetchTasks();
      fetchMemories();
    }
  }, [screen]);

  const fetchTasks = () => {
    fetch(`${HUB_URL}/intelligence/tasks`)
      .then(res => res.json())
      .then(data => setTasks(data || []))
      .catch(err => console.error("Failed to fetch tasks:", err));
  };

  const fetchMemories = () => {
    const url = memorySearch 
      ? `${HUB_URL}/intelligence/memory?q=${encodeURIComponent(memorySearch)}`
      : `${HUB_URL}/intelligence/memory`;
      
    fetch(url)
      .then(res => res.json())
      .then(data => setMemories(data || []))
      .catch(err => console.error("Failed to fetch memories:", err));
  };

  const getThoughtContent = (t: Event) => {
    if (t.type === 'SYSTEM') return t.message;
    if (t.type === 'SIGNAL') return `${t.sender_id} :: ${t.signal_type}`;
    if (t.type === 'HEALING_ACTION') return `Healing applied to ${t.sender_id}`;
    if (t.type === 'HEALTH_ALERT') return t.message;
    return JSON.stringify(t);
  };

  const renderFleet = () => (
    <main className="grid-layout">
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-label">System Stability</div>
          <div className="metric-value" style={{ color: stability > 80 ? 'var(--accent-neon)' : 'var(--accent-warn)' }}>
            {stability}%
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">CPU LOAD</div>
          <div className="metric-value">{metrics.cpu_usage.toFixed(1)}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">MEM USAGE</div>
          <div className="metric-value">{metrics.memory_usage.toFixed(1)}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">GOROUTINES</div>
          <div className="metric-value">{metrics.goroutines}</div>
        </div>
      </div>

      <section className="panel" style={{ maxHeight: '700px' }}>
        <div className="panel-header">
          <h2 className="panel-title">Active Persona Census</h2>
          <div className="status-badge">{agents.length} AGENTS</div>
        </div>
        <div className="agent-grid">
          {agents.map((a) => (
            <div key={a.id} className="agent-card">
              <div className="agent-emoji">{a.emoji}</div>
              <div className="agent-name">{a.name}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {a.id.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
        
        <div className="control-group" style={{ marginTop: '20px' }}>
          <button className="btn-action">FLEET AUDIT</button>
          <button className="btn-action warn">PURGE CACHE</button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Live Thought Stream</h2>
        </div>
        <div className="thought-stream" ref={thoughtStreamRef}>
          {thoughts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              Waiting for agent pulse...
            </div>
          )}
          {thoughts.map((t, i) => (
            <div key={i} className="thought-entry" style={{ 
              borderLeftColor: t.type === 'SIGNAL' ? 'var(--accent-blue)' : t.type === 'SYSTEM' ? 'var(--accent-neon)' : t.type === 'HEALTH_ALERT' ? 'var(--accent-err)' : 'var(--accent-warn)' 
            }}>
              <div className="thought-type" style={{ 
                color: t.type === 'SIGNAL' ? 'var(--accent-blue)' : t.type === 'SYSTEM' ? 'var(--accent-neon)' : t.type === 'HEALTH_ALERT' ? 'var(--accent-err)' : 'var(--accent-warn)' 
              }}>
                {t.type} {t.signal_type ? `:: ${t.signal_type}` : ''}
              </div>
              <div className="thought-body">
                {getThoughtContent(t)}
              </div>
              <div className="thought-meta">
                {t.timestamp || new Date().toISOString()}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );

  const renderGovernance = () => {
    const syncTable = parseTable(extractSection(govContent, '## 🧬 SINCRONIA DE IDENTIDADE'));
    const roadmapTable = parseTable(extractSection(govContent, '### 🗺️ ROADMAP PARA 100%'));

    return (
      <div className="governance-view">
        <div className="panel-header" style={{ marginBottom: '20px' }}>
          <h2 className="panel-title">📜 Document Selector</h2>
          <select 
            className="btn-action" 
            style={{ width: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            value={selectedDoc}
            onChange={(e) => setSelectedDoc(e.target.value)}
          >
            {docList.map(doc => (
              <option key={doc} value={doc}>{doc}</option>
            ))}
          </select>
        </div>

        <h2 className="section-title">🧬 Identity Synchrony</h2>
        <div className="governance-card">
          {syncTable.length > 0 ? (
            <table className="governance-table">
              <thead>
                <tr>
                  {Object.keys(syncTable[0]).map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {syncTable.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((v, j) => <td key={j}>{String(v)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>No synchrony data found in this document.</div>
          )}
        </div>

        <h2 className="section-title">🗺️ Sovereign Roadmap</h2>
        <div className="governance-card">
          {roadmapTable.length > 0 ? (
            <table className="governance-table">
              <thead>
                <tr>
                  {Object.keys(roadmapTable[0]).map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {roadmapTable.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((v, j) => <td key={j}>{String(v)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>No roadmap data found in this document.</div>
          )}
        </div>

        <h2 className="section-title">📄 Full Document Content</h2>
        <div className="governance-card" style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {govContent || "Loading content..."}
        </div>
      </div>
    );
  };

  const renderIntelligence = () => {
    return (
      <div className="grid-layout">
        <section className="panel" style={{ gridColumn: 'span 2' }}>
          <div className="panel-header">
            <h2 className="panel-title">🧠 Agent Memory Explorer</h2>
          </div>
          <div className="thought-stream" style={{ height: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
             <div style={{ display: 'flex', gap: '10px', padding: '15px', flexShrink: 0 }}>
                <input 
                  type="text" 
                  placeholder="Search memory using vector similarity..." 
                  className="btn-action" 
                  style={{ flex: 1, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', textAlign: 'left', cursor: 'text' }}
                  value={memorySearch}
                  onChange={(e) => setMemorySearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchMemories()}
                />
                <button className="btn-action" onClick={fetchMemories}>SEARCH (gRPC)</button>
             </div>
             
             <div style={{ padding: '0 15px', flex: 1 }}>
               {memories.length === 0 ? (
                 <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>Enter a natural language query to retrieve highly relevant historical agent decisions.</p>
               ) : (
                 <table className="governance-table" style={{ width: '100%' }}>
                   <thead>
                     <tr>
                       <th>Score</th>
                       <th>Objective</th>
                       <th>Action</th>
                       <th>Time</th>
                     </tr>
                   </thead>
                   <tbody>
                     {memories.map(m => (
                       <tr key={m.id}>
                         <td style={{ color: m.score > 0.8 ? 'var(--accent-neon)' : 'var(--text-secondary)' }}>
                           {(m.score * 100).toFixed(1)}%
                         </td>
                         <td>{m.objective}</td>
                         <td>{m.action}</td>
                         <td style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>{new Date(m.timestamp).toLocaleTimeString()}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
             </div>
          </div>
        </section>

        <section className="panel" style={{ gridColumn: 'span 2' }}>
          <div className="panel-header">
            <h2 className="panel-title">⏳ AI Task Watcher</h2>
            <div className="status-badge" onClick={fetchTasks} style={{ cursor: 'pointer' }}>🔄 REFRESH</div>
          </div>
          <div className="thought-stream" style={{ height: '300px', overflowY: 'auto' }}>
            {tasks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', padding: '40px', textAlign: 'center' }}>Live monitoring of `ai_tasks` DB and active swarm executions.</p>
            ) : (
              <table className="governance-table" style={{ width: '100%', borderCollapse: 'collapse', padding: '10px' }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Target</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t.id}>
                      <td style={{ color: 'var(--text-secondary)' }}>#{t.id}</td>
                      <td>{t.task_type}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85em' }}>{t.target_file}</td>
                      <td style={{ color: t.status === 'PENDING' ? 'var(--accent-warn)' : t.status === 'COMPLETED' ? 'var(--accent-neon)' : 'var(--accent-err)' }}>
                        {t.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span style={{ fontSize: '1.8rem' }}>🏛️</span>
            <span>SOVEREIGN</span>
          </div>
        </div>
        <nav className="nav-menu">
          <div className={`nav-item ${screen === 'fleet' ? 'active' : ''}`} onClick={() => setScreen('fleet')}>
            <span>🛰️</span> Fleet Operations
          </div>
          <div className={`nav-item ${screen === 'governance' ? 'active' : ''}`} onClick={() => setScreen('governance')}>
            <span>⚖️</span> Governance
          </div>
          <div className={`nav-item ${screen === 'intelligence' ? 'active' : ''}`} onClick={() => setScreen('intelligence')}>
            <span>🧠</span> Intelligence
          </div>
        </nav>
        <div className="status-badge" style={{ marginTop: 'auto', background: 'transparent' }}>
          <div className={`status-dot ${connected ? 'neon' : 'err'}`}></div>
          <span style={{ fontSize: '0.7rem' }}>{connected ? 'HUB ONLINE' : 'HUB OFFLINE'}</span>
        </div>
      </aside>

      <div className="main-content">
        <header className="header">
          <div className="title-group">
            <h1>{screen === 'fleet' ? 'Fleet Operations' : screen === 'governance' ? 'Governance Center' : 'System Intelligence'}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {screen === 'fleet' ? 'Real-time monitoring of 252 Distributed PhD Agents' : 'Operational audit and sovereign compliance status'}
            </p>
          </div>
        </header>

        {screen === 'fleet' && renderFleet()}
        {screen === 'governance' && renderGovernance()}
        {screen === 'intelligence' && renderIntelligence()}
      </div>
    </div>
  );
}

export default App;
