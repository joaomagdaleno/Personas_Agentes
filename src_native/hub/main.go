package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"math"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"sort"
	"strings"
	"sync"
	"time"

	"database/sql"
	"bytes"
	"encoding/binary"

	pb "personas-agentes/hub/proto"

	"crypto/tls"
	"crypto/x509"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/health"
	healthpb "google.golang.org/grpc/health/grpc_health_v1"

	"github.com/fsnotify/fsnotify"
	"github.com/kardianos/service"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/process"
	_ "modernc.org/sqlite"
)

const (
	DefaultGRPCPort      = ":50051"
	DefaultHTTPPort      = ":8080"
	RustSidecarAddr      = "127.0.0.1:50052"
	DefaultDBPath        = "../../system_vault.db"
	DefaultMetadataPath  = "../../src_local/metadata/identity_census.json"
)

type FileAnalysis struct {
	Path     string `json:"path"`
	Exists   bool   `json:"exists"`
	Loc      int    `json:"loc"`
	Sloc     int    `json:"sloc"`
	Comments int    `json:"comments"`
	Intent   string `json:"intent"`
}

// analyzeFileMetadata removed: using Rust scanner instead

func (h *Hub) runRust(command string, args ...string) (string, error) {
	if h.rustClient == nil {
		// Fallback to exec if client not initialized
		fullArgs := append([]string{command}, args...)
		cmd := exec.Command(h.analyzerPath, fullArgs...)
		output, err := cmd.Output()
		if err != nil {
			if exitErr, ok := err.(*exec.ExitError); ok {
				return "", fmt.Errorf("analyzer error (fallback): %w (stderr: %s)", err, string(exitErr.Stderr))
			}
			return "", err
		}
		return string(output), nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var res *pb.AnalyzeResponse
	var err error

	// Hub.proto defines many RPCs that take AnalyzeRequest and return AnalyzeResponse.
	// We can map many "command-style" calls to these RPCs.
	switch command {
	case "analyze":
		res, err = h.rustClient.AnalyzeFile(ctx, &pb.AnalyzeRequest{File: args[0]})
	case "fingerprint":
		res, err = h.rustClient.Fingerprint(ctx, &pb.AnalyzeRequest{File: args[0]})
	case "deps":
		res, err = h.rustClient.GetDependencies(ctx, &pb.AnalyzeRequest{File: args[0]})
	case "dna":
		res, err = h.rustClient.DiscoverIdentity(ctx, &pb.AnalyzeRequest{File: args[0]})
	case "index":
		res, err = h.rustClient.IndexProject(ctx, &pb.AnalyzeRequest{File: args[0]})
	case "topology":
		res, err = h.rustClient.ScanTopology(ctx, &pb.AnalyzeRequest{File: args[0]})
	case "context":
		res, err = h.rustClient.GetContext(ctx, &pb.AnalyzeRequest{File: args[0]})
	case "score":
		res, err = h.rustClient.CalculateScore(ctx, &pb.ScoreRequest{ScoreJson: args[0]})
	case "coverage":
		res, err = h.rustClient.AuditCoverage(ctx, &pb.CoverageRequest{CoverageJson: args[0]})
	case "audit":
		res, err = h.rustClient.Audit(ctx, &pb.AuditRequest{AuditJson: args[0]})
	case "graph-get":
		res, err = h.rustClient.GetKnowledgeGraph(ctx, &pb.GraphRequest{GraphJson: args[0]})
	case "graph-query":
		res, err = h.rustClient.QueryKnowledgeGraph(ctx, &pb.QueryRequest{QueryJson: args[0]})
	default:
		return "", fmt.Errorf("unsupported command via gRPC sidecar: %s", command)
	}

	if err != nil {
		return "", fmt.Errorf("grpc sidecar error: %w", err)
	}
	return res.JsonData, nil
}

func (h *Hub) runRustWithStdin(content string, command string, args ...string) (string, error) {
	if h.rustClient == nil {
		// Fallback to exec if client not initialized
		fullArgs := append([]string{command}, args...)
		cmd := exec.Command(h.analyzerPath, fullArgs...)
		cmd.Stdin = strings.NewReader(content)
		output, err := cmd.Output()
		if err != nil {
			if exitErr, ok := err.(*exec.ExitError); ok {
				return "", fmt.Errorf("analyzer error (fallback): %w (stderr: %s)", err, string(exitErr.Stderr))
			}
			return "", err
		}
		return string(output), nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	var res *pb.AnalyzeResponse
	var err error

	switch command {
	case "analyze":
		file := ""
		if len(args) > 0 {
			file = args[0]
		}
		res, err = h.rustClient.AnalyzeFile(ctx, &pb.AnalyzeRequest{File: file, Content: content})
	case "fingerprint":
		file := ""
		if len(args) > 0 {
			file = args[0]
		}
		res, err = h.rustClient.Fingerprint(ctx, &pb.AnalyzeRequest{File: file, Content: content})
	case "heal":
		res, err = h.rustClient.ExecuteHealing(ctx, &pb.HealingPlan{IssueDescription: content})
	case "connectivity":
		res, err = h.rustClient.GetConnectivity(ctx, &pb.ConnectivityRequest{DependencyMapJson: content})
	case "batch":
		res, err = h.rustClient.Batch(ctx, &pb.BatchRequest{BatchJson: content})
	default:
		return "", fmt.Errorf("unsupported stdin command via gRPC sidecar: %s", command)
	}

	if err != nil {
		return "", fmt.Errorf("grpc sidecar error: %w", err)
	}
	return res.JsonData, nil
}

func (h *Hub) runScanner(args ...string) (string, error) {
	// Scanner is now integrated into Analyzer
	fullArgs := append([]string{"scan"}, args...)
	cmd := exec.Command(h.analyzerPath, fullArgs...)
	output, err := cmd.Output()
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			return "", fmt.Errorf("scanner error: %w (stderr: %s)", err, string(exitErr.Stderr))
		}
		return "", err
	}
	return string(output), nil
}

func (h *Hub) runAnalysis(path string) interface{} {
	output, err := h.runRust("analyze", path)
	if err != nil {
		log.Printf("Analyzer error for %s: %v", path, err)
		return nil
	}
	var res interface{}
	if err := json.Unmarshal([]byte(output), &res); err != nil {
		return nil
	}
	return res
}

type SystemMetrics struct {
	CPUUsage    float64       `json:"cpu_usage"`
	MemoryUsage float64       `json:"memory_usage"`
	GoRoutines  int           `json:"goroutines"`
	HeavyProcs  []ProcessInfo `json:"heavy_processes"`
	Timestamp   time.Time     `json:"timestamp"`
}

type ProcessInfo struct {
	Name   string  `json:"name"`
	PID    int32   `json:"pid"`
	MemMB  float64 `json:"mem_mb"`
	CPUPct float64 `json:"cpu_percent"`
}

type Hub struct {
	pb.UnimplementedHubServiceServer
	pb.UnimplementedRuleProviderServer
	metrics      SystemMetrics
	metricsLock  sync.RWMutex
	analyzerPath string
	watcher      *fsnotify.Watcher
	clients      map[chan string]bool
	clientsLock  sync.Mutex
	broadcast    chan string
	db           *sql.DB
	service      service.Service

	// gRPC Sidecar for Rust
	rustConn   *grpc.ClientConn
	rustClient pb.HubServiceClient

	// Metadata
	census map[string]PersonaMetadata
}

type PersonaMetadata struct {
	ID             string                 `json:"id"`
	SystemPrompt   string                 `json:"system_prompt"`
	PromptTemplate string                 `json:"prompt_template"`
	HealingPrompt  string                 `json:"healing_prompt"`
	Stacks         map[string]StackConfig `json:"stacks"`
}

type StackConfig struct {
	Extensions    []string `json:"extensions"`
	HighPrecision bool     `json:"high_precision"`
	Rules         []struct {
		Regex    string `json:"regex"`
		ScmQuery string `json:"scm_query"`
		Issue    string `json:"issue"`
		Severity string `json:"severity"`
	} `json:"rules"`
}

func (h *Hub) loadMetadata(projectRoot string) {
	path := filepath.Join(projectRoot, "src_local/metadata/identity_census.json")
	data, err := os.ReadFile(path)
	if err != nil {
		log.Printf("⚠️ Failed to load identity census at %s: %v", path, err)
		return
	}

	log.Printf("📂 Read %d bytes from %s", len(data), path)

	var census struct {
		Personas []PersonaMetadata `json:"personas"`
	}
	if err := json.Unmarshal(data, &census); err != nil {
		log.Printf("⚠️ Failed to parse identity census: %v", err)
		return
	}

	h.census = make(map[string]PersonaMetadata)
	for _, p := range census.Personas {
		h.census[p.ID] = p
	}
	log.Printf("📘 Successfully mapped %d personas from %d raw entries", len(h.census), len(census.Personas))
}

type Task struct {
	ID         int    `json:"id"`
	TaskType   string `json:"task_type"`
	TargetFile string `json:"target_file"`
	Status     string `json:"status"`
	Result     string `json:"result"`
	CreatedAt  string `json:"created_at"`
}

type Finding struct {
	File       string `json:"file"`
	Issue      string `json:"issue"`
	Severity   string `json:"severity"`
	Agent      string `json:"agent"`
	Role       string `json:"role"`
	Emoji      string `json:"emoji"`
	Stack      string `json:"stack"`
	MatchCount int    `json:"match_count"`
}

type PeerReviewMessage struct {
	Type            string `json:"type"`
	RequestID       string `json:"request_id"`
	RequesterID     string `json:"requester_id"`
	TargetPersonaID string `json:"target_persona_id"`
	FilePath        string `json:"file_path"`
	Context         string `json:"context,omitempty"`
	Priority        string `json:"priority,omitempty"`
	Timestamp       string `json:"timestamp"`
}

type SignalMessage struct {
	Type        string `json:"type"`
	SenderID    string `json:"sender_id"`
	SignalType  string `json:"signal_type"`
	PayloadJSON string `json:"payload_json"`
	Timestamp   string `json:"timestamp"`
}

func (h *Hub) initDB(projectRoot string) {
	dbPath := filepath.Join(projectRoot, "system_vault.db")
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("Failed to open DB: %v", err)
	}
	h.db = db

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS ai_tasks (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		task_type TEXT,
		target_file TEXT,
		status TEXT DEFAULT 'PENDING',
		result TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)`)
	if err != nil {
		log.Fatalf("Failed to init DB table (ai_tasks): %v", err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS agent_memory (
		id TEXT PRIMARY KEY,
		agent_id TEXT,
		objective TEXT,
		action TEXT,
		result TEXT,
		timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
		embedding BLOB
	)`)
	if err != nil {
		log.Fatalf("Failed to init DB table (agent_memory): %v", err)
	}

	_, err = db.Exec(`CREATE INDEX IF NOT EXISTS idx_agent_memory ON agent_memory (agent_id, timestamp)`)
	if err != nil {
		log.Fatalf("Failed to init DB index (idx_agent_memory): %v", err)
	}
}

func (h *Hub) startWatcher(root string) {
	var err error
	h.watcher, err = fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}
	defer h.watcher.Close()

	censusPath := filepath.Join(root, "src_local/metadata/identity_census.json")
	fullCensusPath, _ := filepath.Abs(censusPath)

	go func() {
		for {
			select {
			case event, ok := <-h.watcher.Events:
				if !ok {
					return
				}
				if event.Has(fsnotify.Write) || event.Has(fsnotify.Create) {
					absPath, _ := filepath.Abs(event.Name)
					if absPath == fullCensusPath {
						log.Printf("🧠 [Hot-Reload] Identity census changed. Refreshing PhD rules...")
						h.loadMetadata(root)
					}

					log.Printf("File event: %v", event)
					h.broadcast <- event.Name
				}
			case err, ok := <-h.watcher.Errors:
				if !ok {
					return
				}
				log.Println("watcher error:", err)
			}
		}
	}()

	err = filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		
		// Otimização Crítica: Pular diretórios massivos para poupar Handles e CPU
		if info.IsDir() {
			name := info.Name()
			if strings.HasPrefix(name, ".") && name != "." && name != ".." {
				return filepath.SkipDir // skip .git, .next, .vscode, etc
			}
			switch name {
			case "node_modules", "target", "dist", "build", "logs", "tmp", "vendor", "out":
				return filepath.SkipDir
			}
			return h.watcher.Add(path)
		}
		return nil
	})
	if err != nil {
		log.Println("Walk error:", err)
	}

	select {} // Block
}

func (h *Hub) startSentinel() {
	ticker := time.NewTicker(3 * time.Second)
	for range ticker.C {
		cpuPerc, _ := cpu.Percent(time.Second, false)
		memStat, _ := mem.VirtualMemory()

		var cpuVal float64
		if len(cpuPerc) > 0 {
			cpuVal = cpuPerc[0]
		}

		procs, _ := process.Processes()
		var heavy []ProcessInfo
		for _, p := range procs {
			m, _ := p.MemoryInfo()
			if m != nil {
				memMB := float64(m.RSS) / (1024 * 1024)
				if memMB > 200 {
					name, _ := p.Name()
					cpuP, _ := p.CPUPercent()
					heavy = append(heavy, ProcessInfo{
						Name:   name,
						PID:    p.Pid,
						MemMB:  memMB,
						CPUPct: cpuP,
					})
				}
			}
		}

		h.metricsLock.Lock()
		h.metrics = SystemMetrics{
			CPUUsage:    cpuVal,
			MemoryUsage: memStat.UsedPercent,
			GoRoutines:  runtime.NumGoroutine(),
			HeavyProcs:  heavy,
			Timestamp:   time.Now(),
		}
		h.metricsLock.Unlock()

		// Broadcast health update
		metricsJSON, _ := json.Marshal(map[string]interface{}{
			"type":    "HEALTH_UPDATE",
			"metrics": h.metrics,
		})
		h.broadcast <- string(metricsJSON)

		// Proactive Alerts
		if cpuVal > 80.0 || memStat.UsedPercent > 80.0 {
			alertJSON, _ := json.Marshal(map[string]interface{}{
				"type":    "HEALTH_ALERT",
				"message": "Resource usage high",
				"cpu":     cpuVal,
				"mem":     memStat.UsedPercent,
			})
			h.broadcast <- string(alertJSON)
		}
	}
}

func (h *Hub) startBroadcaster() {
	h.broadcast = make(chan string)
	for {
		msg := <-h.broadcast
		h.clientsLock.Lock()
		for client := range h.clients {
			select {
			case client <- msg:
			default:
				// Skip if client is slow
			}
		}
		h.clientsLock.Unlock()
	}
}

// Windows Service Support
type program struct {
	hub *Hub
}

func (p *program) Start(s service.Service) error {
	go p.run()
	return nil
}

// gRPC Implementation
func (h *Hub) GetStatus(ctx context.Context, in *pb.Empty) (*pb.StatusResponse, error) {
	h.metricsLock.RLock()
	defer h.metricsLock.RUnlock()

	return &pb.StatusResponse{
		Status:  "HEALTHY",
		Version: "2.0.0-grpc",
		Health: &pb.HealthUpdate{
			CpuUsage:    h.metrics.CPUUsage,
			MemoryUsage: h.metrics.MemoryUsage,
			Goroutines:  int32(h.metrics.GoRoutines),
			Timestamp:   h.metrics.Timestamp.Format(time.RFC3339),
		},
	}, nil
}

func (h *Hub) WatchHealth(in *pb.Empty, stream pb.HubService_WatchHealthServer) error {
	clientChan := make(chan string)
	h.clientsLock.Lock()
	if h.clients == nil {
		h.clients = make(map[chan string]bool)
	}
	h.clients[clientChan] = true
	h.clientsLock.Unlock()

	defer func() {
		h.clientsLock.Lock()
		delete(h.clients, clientChan)
		h.clientsLock.Unlock()
	}()

	for {
		select {
		case msg := <-clientChan:
			if strings.Contains(msg, "HEALTH_UPDATE") {
				var data map[string]interface{}
				json.Unmarshal([]byte(msg), &data)
				metrics := data["metrics"].(map[string]interface{})
				stream.Send(&pb.HealthUpdate{
					CpuUsage:    metrics["cpu_usage"].(float64),
					MemoryUsage: metrics["memory_usage"].(float64),
					Goroutines:  int32(metrics["goroutines"].(float64)),
					Timestamp:   time.Now().Format(time.RFC3339),
				})
			}
		case <-stream.Context().Done():
			return nil
		}
	}
}

func (h *Hub) WatchEvents(in *pb.Empty, stream pb.HubService_WatchEventsServer) error {
	clientChan := make(chan string)
	h.clientsLock.Lock()
	if h.clients == nil {
		h.clients = make(map[chan string]bool)
	}
	h.clients[clientChan] = true
	h.clientsLock.Unlock()

	defer func() {
		h.clientsLock.Lock()
		delete(h.clients, clientChan)
		h.clientsLock.Unlock()
	}()

	for {
		select {
		case msg := <-clientChan:
			if !strings.Contains(msg, "HEALTH_UPDATE") {
				var data map[string]interface{}
				if err := json.Unmarshal([]byte(msg), &data); err == nil {
					eventType, _ := data["type"].(string)
					filePath, _ := data["file_path"].(string)
					stream.Send(&pb.Event{
						Type: eventType,
						Path: filePath,
						Data: msg,
					})
				} else {
					stream.Send(&pb.Event{
						Type: "FILE_EVENT",
						Path: msg,
					})
				}
			}
		case <-stream.Context().Done():
			return nil
		}
	}
}

func (h *Hub) ScanProject(ctx context.Context, in *pb.ScanRequest) (*pb.ScanResponse, error) {
	if h.rustClient != nil {
		log.Printf("🔬 [Hub] Delegating ScanProject to Rust Sidecar via gRPC")
		return h.rustClient.ScanProject(ctx, in)
	}

	output, err := h.runScanner(in.Directory, "--root", in.Root)
	if err != nil {
		return nil, err
	}

	var analysisResults []FileAnalysis
	if err := json.Unmarshal([]byte(output), &analysisResults); err != nil {
		return nil, fmt.Errorf("failed to unmarshal scanner output: %w", err)
	}

	var results []*pb.FileMetadata
	for _, a := range analysisResults {
		results = append(results, &pb.FileMetadata{
			Path:     a.Path,
			Loc:      int32(a.Loc),
			Sloc:     int32(a.Sloc),
			Comments: int32(a.Comments),
			Intent:   a.Intent,
		})
	}

	return &pb.ScanResponse{Files: results}, nil
}

func (h *Hub) AnalyzeFile(ctx context.Context, in *pb.AnalyzeRequest) (*pb.AnalyzeResponse, error) {
	// Optimization: Prefer gRPC Sidecar for all analysis if available
	if h.rustClient != nil {
		log.Printf("🔬 [Hub] Delegating analysis of %s to Rust Sidecar via gRPC", in.File)
		return h.rustClient.AnalyzeFile(ctx, in)
	}

	ext := strings.ToLower(filepath.Ext(in.File))
	var data string
	var err error

	if ext == ".go" || ext == ".kt" || ext == ".dart" {
		data, err = h.runScanner("-file", in.File)
	} else {
		if in.Content != "" {
			data, err = h.runRustWithStdin(in.Content, "analyze", "-", in.File)
		} else {
			data, err = h.runRust("analyze", in.File)
		}
	}

	if err != nil {
		return nil, err
	}
	return &pb.AnalyzeResponse{JsonData: data}, nil
}

func (h *Hub) AnalyzeStream(stream pb.HubService_AnalyzeStreamServer) error {
	for {
		in, err := stream.Recv()
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}

		// Process concurrently or synchronously. For streaming, we process each and send it back immediately.
		ext := strings.ToLower(filepath.Ext(in.File))
		var data string
		var processErr error

		if ext == ".go" || ext == ".kt" || ext == ".dart" {
			data, processErr = h.runScanner("-file", in.File)
		} else {
			if in.Content != "" {
				data, processErr = h.runRustWithStdin(in.Content, "analyze", "-", in.File)
			} else {
				data, processErr = h.runRust("analyze", in.File)
			}
		}

		if processErr != nil {
			log.Printf("AnalyzeStream error on file %s: %v", in.File, processErr)
			continue
		}

		if err := stream.Send(&pb.AnalyzeResponse{JsonData: data}); err != nil {
			return err
		}
	}
}

func (h *Hub) GetDependencies(ctx context.Context, in *pb.AnalyzeRequest) (*pb.AnalyzeResponse, error) {
	data, err := h.runRust("deps", in.File)
	if err != nil {
		return nil, err
	}
	return &pb.AnalyzeResponse{JsonData: data}, nil
}

func (h *Hub) Deduplicate(ctx context.Context, in *pb.DeduplicateRequest) (*pb.AnalyzeResponse, error) {
	// Deduplicate needs a JSON file or stdin. Most reliable is writing to a temp file.
	tmpFile := filepath.Join(os.TempDir(), fmt.Sprintf("dedup_%d.json", time.Now().UnixNano()))
	os.WriteFile(tmpFile, []byte(in.FindingsJson), 0644)
	defer os.Remove(tmpFile)

	data, err := h.runRust("deduplicate", tmpFile)
	if err != nil {
		return nil, err
	}
	return &pb.AnalyzeResponse{JsonData: data}, nil
}

func (h *Hub) Fingerprint(ctx context.Context, in *pb.AnalyzeRequest) (*pb.AnalyzeResponse, error) {
	var data string
	var err error
	if in.Content != "" {
		data, err = h.runRustWithStdin(in.Content, "fingerprint", "-", in.File)
	} else {
		data, err = h.runRust("fingerprint", in.File)
	}
	if err != nil {
		return nil, err
	}
	return &pb.AnalyzeResponse{JsonData: data}, nil
}

func (h *Hub) DiscoverIdentity(ctx context.Context, in *pb.AnalyzeRequest) (*pb.AnalyzeResponse, error) {
	data, err := h.runRust("dna", in.File)
	if err != nil {
		return nil, err
	}
	return &pb.AnalyzeResponse{JsonData: data}, nil
}

func (h *Hub) IndexProject(ctx context.Context, in *pb.AnalyzeRequest) (*pb.AnalyzeResponse, error) {
	data, err := h.runRust("index", in.File)
	if err != nil {
		return nil, err
	}
	return &pb.AnalyzeResponse{JsonData: data}, nil
}

func (h *Hub) ScanTopology(ctx context.Context, in *pb.AnalyzeRequest) (*pb.AnalyzeResponse, error) {
	data, err := h.runRust("topology", in.File)
	if err != nil {
		return nil, err
	}
	return &pb.AnalyzeResponse{JsonData: data}, nil
}

func (h *Hub) GetContext(ctx context.Context, in *pb.AnalyzeRequest) (*pb.AnalyzeResponse, error) {
	data, err := h.runRust("context", in.File)
	if err != nil {
		return nil, err
	}
	return &pb.AnalyzeResponse{JsonData: data}, nil
}

func (h *Hub) GetConnectivity(ctx context.Context, in *pb.ConnectivityRequest) (*pb.AnalyzeResponse, error) {
	tmpFile := filepath.Join(os.TempDir(), fmt.Sprintf("conn_%d.json", time.Now().UnixNano()))
	err := os.WriteFile(tmpFile, []byte(in.DependencyMapJson), 0644)
	if err != nil {
		return nil, err
	}
	defer os.Remove(tmpFile)

	data, err := h.runRust("connectivity", tmpFile)
	if err != nil {
		return nil, err
	}
	return &pb.AnalyzeResponse{JsonData: data}, nil
}

func (h *Hub) Audit(ctx context.Context, in *pb.AuditRequest) (*pb.AnalyzeResponse, error) {
	tmpFile := filepath.Join(os.TempDir(), fmt.Sprintf("audit_%d.json", time.Now().UnixNano()))
	err := os.WriteFile(tmpFile, []byte(in.AuditJson), 0644)
	if err != nil {
		return nil, err
	}
	defer os.Remove(tmpFile)

	data, err := h.runRust("audit", tmpFile)
	if err != nil {
		return nil, err
	}
	return &pb.AnalyzeResponse{JsonData: data}, nil
}

func (h *Hub) Batch(ctx context.Context, in *pb.BatchRequest) (*pb.AnalyzeResponse, error) {
	tmpFile := filepath.Join(os.TempDir(), fmt.Sprintf("batch_%d.json", time.Now().UnixNano()))
	err := os.WriteFile(tmpFile, []byte(in.BatchJson), 0644)
	if err != nil {
		return nil, err
	}
	defer os.Remove(tmpFile)

	data, err := h.runRust("batch", tmpFile)
	if err != nil {
		return nil, err
	}
	return &pb.AnalyzeResponse{JsonData: data}, nil
}

func (h *Hub) Reason(ctx context.Context, in *pb.ReasonRequest) (*pb.AnalyzeResponse, error) {
	if h.rustClient != nil {
		ctxT, cancel := context.WithTimeout(ctx, 60*time.Second)
		defer cancel()
		return h.rustClient.Reason(ctxT, in)
	}

	// Fallback to CLI
	tmpFile := filepath.Join(os.TempDir(), fmt.Sprintf("reason_%d.txt", time.Now().UnixNano()))
	err := os.WriteFile(tmpFile, []byte(in.Prompt), 0644)
	if err != nil {
		return nil, err
	}
	defer os.Remove(tmpFile)

	data, err := h.runRust("reason", tmpFile)
	if err != nil {
		return nil, err
	}
	return &pb.AnalyzeResponse{JsonData: data}, nil
}

func (h *Hub) Patterns(ctx context.Context, in *pb.PatternRequest) (*pb.AnalyzeResponse, error) {
	tmpFile := filepath.Join(os.TempDir(), fmt.Sprintf("patterns_%d.json", time.Now().UnixNano()))
	err := os.WriteFile(tmpFile, []byte(in.PatternJson), 0644)
	if err != nil {
		return nil, err
	}
	defer os.Remove(tmpFile)

	data, err := h.runRust("patterns", tmpFile)
	if err != nil {
		return nil, err
	}
	return &pb.AnalyzeResponse{JsonData: data}, nil
}

func (h *Hub) Penalty(ctx context.Context, in *pb.PenaltyRequest) (*pb.AnalyzeResponse, error) {
	tmpFile := filepath.Join(os.TempDir(), fmt.Sprintf("penalty_%d.json", time.Now().UnixNano()))
	err := os.WriteFile(tmpFile, []byte(in.PenaltyJson), 0644)
	if err != nil {
		return nil, err
	}
	defer os.Remove(tmpFile)

	data, err := h.runRust("penalty", tmpFile)
	if err != nil {
		return nil, err
	}
	return &pb.AnalyzeResponse{JsonData: data}, nil
}

func (h *Hub) CalculateScore(ctx context.Context, in *pb.ScoreRequest) (*pb.AnalyzeResponse, error) {
	tmpFile := filepath.Join(os.TempDir(), fmt.Sprintf("score_%d.json", time.Now().UnixNano()))
	err := os.WriteFile(tmpFile, []byte(in.ScoreJson), 0644)
	if err != nil {
		return nil, err
	}
	defer os.Remove(tmpFile)

	data, err := h.runRust("score", tmpFile)
	if err != nil {
		return nil, err
	}
	return &pb.AnalyzeResponse{JsonData: data}, nil
}

func (h *Hub) AuditCoverage(ctx context.Context, in *pb.CoverageRequest) (*pb.AnalyzeResponse, error) {
	tmpFile := filepath.Join(os.TempDir(), fmt.Sprintf("coverage_%d.json", time.Now().UnixNano()))
	err := os.WriteFile(tmpFile, []byte(in.CoverageJson), 0644)
	if err != nil {
		return nil, err
	}
	defer os.Remove(tmpFile)

	data, err := h.runRust("coverage", tmpFile)
	if err != nil {
		return nil, err
	}
	return &pb.AnalyzeResponse{JsonData: data}, nil
}

func (h *Hub) GetKnowledgeGraph(ctx context.Context, in *pb.GraphRequest) (*pb.AnalyzeResponse, error) {
	data, err := h.runRust("graph-get", in.GraphJson)
	if err != nil {
		return nil, err
	}
	return &pb.AnalyzeResponse{JsonData: data}, nil
}

func (h *Hub) QueryKnowledgeGraph(ctx context.Context, in *pb.QueryRequest) (*pb.AnalyzeResponse, error) {
	data, err := h.runRust("graph-query", in.QueryJson)
	if err != nil {
		return nil, err
	}
	return &pb.AnalyzeResponse{JsonData: data}, nil
}

func (h *Hub) ExecuteHealing(ctx context.Context, in *pb.HealingPlan) (*pb.AnalyzeResponse, error) {
	if h.rustClient != nil {
		log.Printf("🛠️ [Auto-Healing] Delegating healing plan for %s to Rust Sidecar via gRPC...", in.FilePath)
		return h.rustClient.ExecuteHealing(ctx, in)
	}

	// Fallback to CLI-based execution if gRPC client is not initialized
	log.Printf("⚠️ [Auto-Healing] Rust Sidecar gRPC not available, falling back to CLI for %s", in.FilePath)
	planJSON, err := json.Marshal(in)
	if err != nil {
		return nil, err
	}

	data, err := h.runRustWithStdin(string(planJSON), "heal", "-")
	if err != nil {
		return nil, err
	}

	return &pb.AnalyzeResponse{JsonData: data}, nil
}


func (h *Hub) Remember(ctx context.Context, in *pb.MemoryEntry) (*pb.Empty, error) {
	log.Printf("🧠 [Memory] Recording decision for agent %s: %s", in.AgentId, in.Objective)

	// Convert float32 embedding to BLOB
	embBuf := new(bytes.Buffer)
	for _, f := range in.Embedding {
		binary.Write(embBuf, binary.LittleEndian, f)
	}

	_, err := h.db.Exec(`INSERT INTO agent_memory (id, agent_id, objective, action, result, embedding) 
		VALUES (?, ?, ?, ?, ?, ?)`,
		in.Id, in.AgentId, in.Objective, in.Action, in.Result, embBuf.Bytes())
	if err != nil {
		return nil, err
	}
	return &pb.Empty{}, nil
}

type memoryScore struct {
	entry *pb.MemoryEntry
	score float64
}

func cosineSimilarity(a, b []float32) float64 {
	if len(a) != len(b) || len(a) == 0 {
		return 0.0
	}
	var dotProduct, normA, normB float64
	for i := range a {
		valA := float64(a[i])
		valB := float64(b[i])
		dotProduct += valA * valB
		normA += valA * valA
		normB += valB * valB
	}
	if normA == 0 || normB == 0 {
		return 0.0
	}
	return dotProduct / (math.Sqrt(normA) * math.Sqrt(normB))
}

func (h *Hub) Retrieve(in *pb.MemoryQuery, stream pb.HubService_RetrieveServer) error {
	log.Printf("🧠 [Memory] Retrieving records for agent %s query: %s", in.AgentId, in.Query)

	var queryEmb []float32
	if in.Query != "" && h.rustClient != nil {
		res, err := h.rustClient.Embed(stream.Context(), &pb.EmbedRequest{Text: in.Query})
		if err == nil && res != nil {
			queryEmb = res.Embedding
		}
	}

	querySQL := `SELECT id, agent_id, objective, action, result, timestamp, embedding FROM agent_memory WHERE agent_id = ? ORDER BY timestamp DESC`
	if len(queryEmb) == 0 {
		querySQL += fmt.Sprintf(" LIMIT %d", in.Limit)
	} else {
		// Otimização Crítica: Se temos embedding para busca, ainda devemos limitar o pull inicial do DB
		// Em vez de trazer N records, limitamos para impedir consumo O(N) total de RAM e CPU no Hub.
		querySQL += " LIMIT 1000"
	}

	rows, err := h.db.Query(querySQL, in.AgentId)
	if err != nil {
		return err
	}
	defer rows.Close()

	var allMemories []memoryScore

	for rows.Next() {
		var m pb.MemoryEntry
		var emb []byte
		err := rows.Scan(&m.Id, &m.AgentId, &m.Objective, &m.Action, &m.Result, &m.Timestamp, &emb)
		if err != nil {
			return err
		}

		fSlice := make([]float32, len(emb)/4)
		if len(emb) > 0 {
			binary.Read(bytes.NewReader(emb), binary.LittleEndian, &fSlice)
		}
		m.Embedding = fSlice

		score := 1.0
		if len(queryEmb) > 0 && len(fSlice) > 0 {
			score = cosineSimilarity(queryEmb, fSlice)
		}

		allMemories = append(allMemories, memoryScore{entry: &m, score: score})
	}

	if len(queryEmb) > 0 {
		sort.SliceStable(allMemories, func(i, j int) bool {
			return allMemories[i].score > allMemories[j].score
		})
		limit := int(in.Limit)
		if limit > len(allMemories) {
			limit = len(allMemories)
		}
		allMemories = allMemories[:limit]
	}

	for _, ms := range allMemories {
		if err := stream.Send(ms.entry); err != nil {
			return err
		}
	}
	return nil
}

func (h *Hub) Embed(ctx context.Context, in *pb.EmbedRequest) (*pb.EmbedResponse, error) {
	if h.rustClient != nil {
		return h.rustClient.Embed(ctx, in)
	}
	return nil, fmt.Errorf("rust sidecar not available for embedding")
}

func (h *Hub) EnqueueTask(ctx context.Context, in *pb.TaskRequest) (*pb.TaskResponse, error) {
	_, err := h.db.Exec("INSERT INTO ai_tasks (task_type, target_file) VALUES (?, ?)", in.TaskType, in.TargetFile)
	if err != nil {
		return nil, err
	}
	return &pb.TaskResponse{Success: true}, nil
}

func (h *Hub) GetPendingTasks(ctx context.Context, in *pb.PendingRequest) (*pb.PendingResponse, error) {
	rows, err := h.db.Query("SELECT id, task_type, target_file, status, created_at FROM ai_tasks WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT ?", in.Limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []*pb.Task
	for rows.Next() {
		var t Task
		rows.Scan(&t.ID, &t.TaskType, &t.TargetFile, &t.Status, &t.CreatedAt)
		tasks = append(tasks, &pb.Task{
			Id:         int32(t.ID),
			TaskType:   t.TaskType,
			TargetFile: t.TargetFile,
			Status:     t.Status,
		})
	}
	return &pb.PendingResponse{Tasks: tasks}, nil
}

// RuleProvider Implementation
func (h *Hub) GetRules(ctx context.Context, in *pb.RuleRequest) (*pb.RuleResponse, error) {
	p, ok := h.census[in.PersonaId]
	if !ok {
		return nil, fmt.Errorf("persona %s not found", in.PersonaId)
	}

	s, ok := p.Stacks[in.Stack]
	if !ok {
		return nil, fmt.Errorf("stack %s not found for persona %s", in.Stack, in.PersonaId)
	}

	var pbRules []*pb.Rule
	for _, r := range s.Rules {
		pbRules = append(pbRules, &pb.Rule{
			Regex:    r.Regex,
			ScmQuery: r.ScmQuery,
			Issue:    r.Issue,
			Severity: r.Severity,
		})
	}

	return &pb.RuleResponse{
		Rules:          pbRules,
		Extensions:     s.Extensions,
		SystemPrompt:   p.SystemPrompt,
		PromptTemplate: p.PromptTemplate,
	}, nil
}

func (h *Hub) AnalyzeCode(ctx context.Context, in *pb.AnalyzeCodeRequest) (*pb.AnalyzeResponse, error) {
	log.Printf("🔬 Centralized Analysis: %s on %s stack", in.PersonaId, in.Stack)

	p, ok := h.census[in.PersonaId]
	if !ok {
		return nil, fmt.Errorf("persona %s not found in census", in.PersonaId)
	}

	s, ok := p.Stacks[in.Stack]
	if !ok {
		// Return empty list if stack not configured for this persona
		return &pb.AnalyzeResponse{JsonData: "[]"}, nil
	}

	findings := []Finding{}

	for _, rule := range s.Rules {
		re, err := regexp.Compile(rule.Regex)
		if err != nil {
			log.Printf("⚠️ Invalid regex for %s/%s: %s", in.PersonaId, in.Stack, rule.Regex)
			continue
		}

		matches := re.FindAllStringIndex(in.Content, -1)
		if len(matches) > 0 {
			findings = append(findings, Finding{
				File:       "embedded_content",
				Issue:      rule.Issue,
				Severity:   rule.Severity,
				Agent:      in.PersonaId,
				Role:       "PhD Specialist",
				Emoji:      "🎓",
				Stack:      in.Stack,
				MatchCount: len(matches),
			})
		}
	}

	// 2. High-Precision PhD Upgrade (Rust Sidecar)
	if s.HighPrecision && h.rustClient != nil {
		log.Printf("🧪 [HighPrecision] Delegating %s logic to Rust Sidecar...", in.PersonaId)

		// Match direct expectations of audit::BulkAuditRequest
		type FileEntry struct {
			Path    string `json:"path"`
			Content string `json:"content"`
		}
		type PersonaRuleSet struct {
			Agent      string      `json:"agent"`
			Role       string      `json:"role"`
			Emoji      string      `json:"emoji"`
			Stack      string      `json:"stack"`
			Extensions []string    `json:"extensions"`
			Rules      interface{} `json:"rules"`
		}

		rustAuditReq := struct {
			Files        []FileEntry      `json:"files"`
			PersonaRules []PersonaRuleSet `json:"persona_rules"`
		}{
			Files: []FileEntry{{Path: "embedded_content", Content: in.Content}},
			PersonaRules: []PersonaRuleSet{{
				Agent:      in.PersonaId,
				Role:       "PhD Specialist",
				Emoji:      "🎓",
				Stack:      in.Stack,
				Extensions: s.Extensions,
				Rules:      s.Rules,
			}},
		}

		rustReq, _ := json.Marshal(rustAuditReq)
		res, err := h.rustClient.Audit(ctx, &pb.AuditRequest{AuditJson: string(rustReq)})
		if err == nil {
			var rustFindings []Finding
			if err := json.Unmarshal([]byte(res.JsonData), &rustFindings); err == nil {
				findings = append(findings, rustFindings...)
			}
		} else {
			log.Printf("⚠️ Rust sidecar analysis failed: %v", err)
		}
	}

	jsonRes, _ := json.Marshal(findings)
	return &pb.AnalyzeResponse{JsonData: string(jsonRes)}, nil
}

func (h *Hub) RequestPeerReview(ctx context.Context, in *pb.PeerReviewRequest) (*pb.PeerReviewResponse, error) {
	requestID := fmt.Sprintf("rev_%d", time.Now().UnixNano())
	log.Printf("🤝 [Swarm] Peer review requested by %s for %s (Target: %s)", in.RequesterId, in.FilePath, in.TargetPersonaId)

	msgBytes, _ := json.Marshal(PeerReviewMessage{
		Type:            "PEER_REVIEW_REQUEST",
		RequestID:       requestID,
		RequesterID:     in.RequesterId,
		TargetPersonaID: in.TargetPersonaId,
		FilePath:        in.FilePath,
		Context:         in.Context,
		Priority:        in.Priority,
		Timestamp:       time.Now().Format(time.RFC3339),
	})
	h.broadcast <- string(msgBytes)

	return &pb.PeerReviewResponse{
		RequestId: requestID,
		Status:    "ENQUEUED",
	}, nil
}

func (h *Hub) BroadcastSignal(ctx context.Context, in *pb.SignalRequest) (*pb.Empty, error) {
	log.Printf("📢 [Swarm] Signal broadcast by %s: %s", in.SenderId, in.SignalType)

	msgBytes, _ := json.Marshal(SignalMessage{
		Type:        "SIGNAL",
		SenderID:    in.SenderId,
		SignalType:  in.SignalType,
		PayloadJSON: in.PayloadJson,
		Timestamp:   time.Now().Format(time.RFC3339),
	})
	h.broadcast <- string(msgBytes)

	return &pb.Empty{}, nil
}

func (h *Hub) UpdateTask(ctx context.Context, in *pb.UpdateTaskRequest) (*pb.Empty, error) {
	_, err := h.db.Exec("UPDATE ai_tasks SET status = ?, result = ? WHERE id = ?", in.Status, in.Result, in.TaskId)
	if err != nil {
		return nil, err
	}
	h.broadcast <- fmt.Sprintf("TASK_UPDATED: %d -> %s", in.TaskId, in.Status)
	return &pb.Empty{}, nil
}

func (h *Hub) ServeGovernanceList(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	var docs []string
	searchPaths := []string{"../../docs", "../../", "./docs", "."}
	for _, path := range searchPaths {
		files, err := os.ReadDir(path)
		if err != nil {
			continue
		}
		for _, f := range files {
			if !f.IsDir() && strings.HasSuffix(f.Name(), ".md") {
				docs = append(docs, f.Name())
			}
		}
	}

	// Deduplicate
	unique := make(map[string]bool)
	var result []string
	for _, d := range docs {
		if !unique[d] {
			unique[d] = true
			result = append(result, d)
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"documents": result,
	})
}

func (h *Hub) ServeGovernance(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	fileName := r.URL.Query().Get("file")
	if fileName == "" {
		fileName = "walkthrough.md"
	}

	// Sanitize fileName to prevent path traversal
	fileName = filepath.Base(fileName)

	var data []byte
	var err error
	searchPaths := []string{"../../" + fileName, "../../docs/" + fileName, "./" + fileName, "./docs/" + fileName}

	for _, p := range searchPaths {
		data, err = os.ReadFile(p)
		if err == nil {
			break
		}
	}

	if err != nil {
		http.Error(w, "Document not found: "+fileName, http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"content": string(data),
		"file":    fileName,
	})
}

func (h *Hub) ServeIntelligenceMemory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	query := r.URL.Query().Get("q")
	agentId := r.URL.Query().Get("agent")
	if agentId == "" {
		agentId = "healer" // default for demo purposes
	}

	var queryEmb []float32
	if query != "" && h.rustClient != nil {
		res, err := h.rustClient.Embed(r.Context(), &pb.EmbedRequest{Text: query})
		if err == nil && res != nil {
			queryEmb = res.Embedding
		}
	}

	querySQL := `SELECT id, agent_id, objective, action, result, timestamp, embedding FROM agent_memory WHERE agent_id = ? ORDER BY timestamp DESC`
	if len(queryEmb) == 0 {
		querySQL += ` LIMIT 50`
	} else {
		// Otimização Crítica: Trava de segurança para impedir Full Table Scan para RAM em buscas contextuais.
		querySQL += ` LIMIT 1000`
	}

	rows, err := h.db.Query(querySQL, agentId)
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var allMemories []memoryScore
	for rows.Next() {
		var m pb.MemoryEntry
		var emb []byte
		if err := rows.Scan(&m.Id, &m.AgentId, &m.Objective, &m.Action, &m.Result, &m.Timestamp, &emb); err != nil {
			continue
		}

		fSlice := make([]float32, len(emb)/4)
		if len(emb) > 0 {
			binary.Read(bytes.NewReader(emb), binary.LittleEndian, &fSlice)
		}
		
		score := 1.0
		if len(queryEmb) > 0 && len(fSlice) > 0 {
			score = cosineSimilarity(queryEmb, fSlice)
		}
		
		// Omit embedding from JSON response to save bandwidth
		m.Embedding = nil
		allMemories = append(allMemories, memoryScore{entry: &m, score: score})
	}

	if len(queryEmb) > 0 {
		sort.SliceStable(allMemories, func(i, j int) bool {
			return allMemories[i].score > allMemories[j].score
		})
		if len(allMemories) > 50 {
			allMemories = allMemories[:50]
		}
	}

	type MemoryResponse struct {
		Id        string  `json:"id"`
		Objective string  `json:"objective"`
		Action    string  `json:"action"`
		Result    string  `json:"result"`
		Timestamp string  `json:"timestamp"`
		Score     float64 `json:"score"`
	}

	var result []MemoryResponse
	for _, ms := range allMemories {
		result = append(result, MemoryResponse{
			Id:        ms.entry.Id,
			Objective: ms.entry.Objective,
			Action:    ms.entry.Action,
			Result:    ms.entry.Result,
			Timestamp: ms.entry.Timestamp,
			Score:     ms.score,
		})
	}

	json.NewEncoder(w).Encode(result)
}

func (h *Hub) ServeIntelligenceTasks(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	rows, err := h.db.Query("SELECT id, task_type, target_file, status, result, created_at FROM ai_tasks ORDER BY created_at DESC LIMIT 50")
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var tasks []Task
	for rows.Next() {
		var t Task
		rows.Scan(&t.ID, &t.TaskType, &t.TargetFile, &t.Status, &t.Result, &t.CreatedAt)
		tasks = append(tasks, t)
	}

	json.NewEncoder(w).Encode(tasks)
}

func (h *Hub) ServeCensus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	var personas []PersonaMetadata
	for _, p := range h.census {
		personas = append(personas, p)
	}
	json.NewEncoder(w).Encode(map[string]interface{}{"personas": personas})
}

func (h *Hub) ServeSSE(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	ch := make(chan string, 10)
	// Ensure clients map is initialized
	h.clientsLock.Lock()
	if h.clients == nil {
		h.clients = make(map[chan string]bool)
	}
	h.clients[ch] = true
	h.clientsLock.Unlock()

	defer func() {
		h.clientsLock.Lock()
		delete(h.clients, ch)
		h.clientsLock.Unlock()
	}()

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	// Send initial connection event
	fmt.Fprintf(w, "data: %s\n\n", `{"type":"SYSTEM","message":"CONNECTED_TO_HUB"}`)
	flusher.Flush()

	for {
		select {
		case msg, ok := <-ch:
			if !ok {
				return
			}
			_, err := fmt.Fprintf(w, "data: %s\n\n", msg)
			if err != nil {
				return
			}
			flusher.Flush()
		case <-r.Context().Done():
			return
		}
	}
}

func (p *program) run() {
	// Precise map initialization before async goroutines start
	p.hub.clientsLock.Lock()
	if p.hub.clients == nil {
		p.hub.clients = make(map[chan string]bool)
	}
	p.hub.clientsLock.Unlock()

	if p.hub.census == nil {
		p.hub.census = make(map[string]PersonaMetadata)
	}

	p.hub.initDB("../..")
	p.hub.loadMetadata("../..")
	go p.hub.startSentinel()
	go p.hub.startBroadcaster()
	go p.hub.startWatcher("../..")

	// Start Sovereign Dashboard SSE Server
	go func() {
		http.HandleFunc("/events", p.hub.ServeSSE)
		http.HandleFunc("/governance", p.hub.ServeGovernance)
		http.HandleFunc("/governance/list", p.hub.ServeGovernanceList)
		http.HandleFunc("/intelligence/memory", p.hub.ServeIntelligenceMemory)
		http.HandleFunc("/intelligence/tasks", p.hub.ServeIntelligenceTasks)
		http.HandleFunc("/census", p.hub.ServeCensus)
		log.Printf("📊 Sovereign Dashboard SSE Server listening on %s", DefaultHTTPPort)
		if err := http.ListenAndServe(DefaultHTTPPort, nil); err != nil {
			log.Printf("⚠️ Dashboard server failed: %v", err)
		}
	}()

	// Connect to Rust gRPC Sidecar
	go func() {
		addr := RustSidecarAddr
		conn, err := grpc.Dial(addr, grpc.WithInsecure())
		if err != nil {
			log.Printf("⚠️ Could not connect to Rust sidecar at %s: %v", addr, err)
			return
		}
		p.hub.rustConn = conn
		p.hub.rustClient = pb.NewHubServiceClient(conn)
		log.Printf("🔌 Connected to Rust gRPC sidecar at %s", addr)
	}()

	// gRPC Server with optional mTLS
	lis, err := net.Listen("tcp", DefaultGRPCPort)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	var grpcServer *grpc.Server

	// Try loading mTLS certs from tls_certs/ directory
	certFile := filepath.Join("tls_certs", "server.crt")
	keyFile := filepath.Join("tls_certs", "server.key")
	caFile := filepath.Join("tls_certs", "ca.crt")

	if _, e := os.Stat(certFile); e == nil {
		cert, err := tls.LoadX509KeyPair(certFile, keyFile)
		if err != nil {
			log.Fatalf("failed to load server cert: %v", err)
		}

		caCert, err := os.ReadFile(caFile)
		if err != nil {
			log.Fatalf("failed to read CA cert: %v", err)
		}

		caPool := x509.NewCertPool()
		caPool.AppendCertsFromPEM(caCert)

		tlsConfig := &tls.Config{
			Certificates: []tls.Certificate{cert},
			ClientAuth:   tls.RequireAndVerifyClientCert,
			ClientCAs:    caPool,
		}

		grpcServer = grpc.NewServer(grpc.Creds(credentials.NewTLS(tlsConfig)))
		log.Println("🔒 mTLS enabled for gRPC server")
	} else {
		grpcServer = grpc.NewServer()
		log.Println("⚠️ mTLS certs not found, running insecure (dev mode)")
	}

	pb.RegisterHubServiceServer(grpcServer, p.hub)
	pb.RegisterRuleProviderServer(grpcServer, p.hub)

	// Register standard gRPC Health Check service
	healthSrv := health.NewServer()
	healthpb.RegisterHealthServer(grpcServer, healthSrv)
	healthSrv.SetServingStatus("", healthpb.HealthCheckResponse_SERVING)
	healthSrv.SetServingStatus("hub.HubService", healthpb.HealthCheckResponse_SERVING)

	log.Printf("📡 gRPC Server listening on :50051")
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}

func (p *program) Stop(s service.Service) error {
	return nil
}

func main() {
	action := flag.String("service", "", "Control the system service: install, uninstall, start, stop")
	flag.Parse()

	svcConfig := &service.Config{
		Name:        "SovereignHub",
		DisplayName: "Native Sovereign Hub",
		Description: "Persistência e Análise Nativa para Personas Agentes.",
	}

	exePath := filepath.Join("..", "analyzer", "target", "release", "analyzer.exe")
	if _, err := os.Stat(exePath); os.IsNotExist(err) {
		exePath = filepath.Join("src_native", "analyzer", "target", "release", "analyzer.exe")
	}

	hub := &Hub{
		analyzerPath: exePath,
	}

	prg := &program{hub: hub}
	s, err := service.New(prg, svcConfig)
	if err != nil {
		log.Fatal(err)
	}
	hub.service = s

	if *action != "" {
		err := service.Control(s, *action)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Printf("Service %s successfully\n", *action)
		return
	}

	if err := s.Run(); err != nil {
		log.Fatal(err)
	}
}
