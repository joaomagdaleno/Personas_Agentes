import { useState, useEffect, useRef } from 'react';
import censusData from './assets/census.json';
import { extractSection, parseTable } from './utils/md_parser';

interface Persona {
  id: string;
  name: string;
  emoji: string;
  role: string;
  phd_identity?: string;
}

interface Metrics {
  cpu_usage: number;
  memory_usage: number;
  goroutines: number;
  heavy_processes: any[];
  timestamp: string;
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

function App() {
  const [agents] = useState<Persona[]>(censusData.personas);
  const [thoughts, setThoughts] = useState<Event[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ cpu_usage: 0, memory_usage: 0, goroutines: 0, heavy_processes: [], timestamp: '' });
  const [connected, setConnected] = useState(false);
  const [stability, setStability] = useState(100);
  const [screen, setScreen] = useState<Screen>('fleet');
  const [govContent, setGovContent] = useState<string>('');
  
  const thoughtStreamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:8080/events');

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

  useEffect(() => {
    if (screen === 'governance') {
      fetch('http://localhost:8080/governance')
        .then(res => res.json())
        .then(data => setGovContent(data.content))
        .catch(err => console.error("Failed to fetch governance:", err));
    }
  }, [screen]);

  // Slowly recover stability
  useEffect(() => {
    const timer = setInterval(() => {
      setStability((prev) => Math.min(100, prev + 1));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

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
        <h2 className="section-title">🧬 Identity Synchrony</h2>
        <div className="governance-card">
          <table className="governance-table">
            <thead>
              <tr>
                {syncTable.length > 0 && Object.keys(syncTable[0]).map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {syncTable.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((v: any, j) => <td key={j}>{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="section-title">🗺️ Sovereign Roadmap</h2>
        <div className="governance-card">
          <table className="governance-table">
            <thead>
              <tr>
                {roadmapTable.length > 0 && Object.keys(roadmapTable[0]).map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {roadmapTable.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((v: any, j) => <td key={j}>{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="section-title">📜 Critical Walkthrough</h2>
        <div className="governance-card" style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {govContent.split('## Verificação Final')[0].slice(0, 2000)}...
        </div>
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
        {screen === 'intelligence' && (
          <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
            Intelligence Analysis Coming Soon...
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
