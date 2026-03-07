package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync/atomic"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/getlantern/systray"
	_ "github.com/ncruces/go-sqlite3/driver"
	_ "github.com/ncruces/go-sqlite3/embed"
	"github.com/shirou/gopsutil/v4/process"
	"github.com/sqweek/dialog"
)

var (
	dbPath          string
	pendingAnalysis int32
)

func main() {
	cwd, _ := os.Getwd()
	dbPath = filepath.Join(cwd, "..", "..", "system_vault.db")
	projectRoot := filepath.Join(cwd, "..", "..")

	go startFileWatcher(projectRoot)

	systray.Run(onReady, onExit)
}

func startFileWatcher(root string) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Println("Erro ao iniciar fsnotify:", err)
		return
	}

	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				if event.Has(fsnotify.Write) {
					ext := filepath.Ext(event.Name)
					if ext == ".ts" || ext == ".py" || ext == ".go" {
						atomic.StoreInt32(&pendingAnalysis, 1)
					}
				}
			case err, ok := <-watcher.Errors:
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
		if info.IsDir() {
			name := info.Name()
			if name == "node_modules" || strings.HasPrefix(name, ".") || name == "target" || name == "build" || name == ".gemini" {
				return filepath.SkipDir
			}
			return watcher.Add(path)
		}
		return nil
	})
	if err != nil {
		log.Println("Walk error:", err)
	}
}

func onReady() {
	systray.SetIcon(iconData)
	systray.SetTitle("🏛️ Persona Agent")
	systray.SetTooltip("Sovereign Watcher (Go Native)")

	mProjects := systray.AddMenuItem("Gerir Projetos", "Abre o gestor de projetos")
	mExecute := systray.AddMenuItem("Executar Todos Agora", "Dispara o diagnóstico imediato")
	systray.AddSeparator()
	mQuit := systray.AddMenuItem("Sair", "Encerra o agente")

	go func() {
		for {
			select {
			case <-mProjects.ClickedCh:
				projects := getProjectsString()
				dialog.Message("%s", projects).Title("🏛️ Gestor de Projetos").Info()
			case <-mExecute.ClickedCh:
				dialog.Message("Iniciando Diagnóstico Full...").Title("🚀 Ação").Info()
			case <-mQuit.ClickedCh:
				systray.Quit()
				return
			}
		}
	}()

	// Background Monitor Loop
	go monitorLoop()
}

func onExit() {
	// Cleanup if needed
}

func monitorLoop() {
	for {
		idle := GetIdleTime()
		pid, title := GetActiveWindowInfo()

		appName := getAppName(pid)
		category := classifyActivity(appName, title)

		if idle > 300 {
			fmt.Printf("🌙 [Idle] Sistema ocioso há %.0fs. Modo Deep.\n", idle)
			if atomic.LoadInt32(&pendingAnalysis) == 1 {
				fmt.Println("🚀 Acionando diagnóstico de fundo inteligente via Hub...")
				go func() {
					resp, err := http.Get("http://localhost:8080/scan?dir=./src_local")
					if err == nil {
						resp.Body.Close()
						fmt.Println("✅ Diagnóstico WASM/Hub assíncrono concluído silenciosamente.")
						// Reset flag
						atomic.StoreInt32(&pendingAnalysis, 0)
					}
				}()
			}
		} else {
			fmt.Printf("👀 [Active] %s (%s) - Contexto: %s\n", appName, title, category)
		}

		time.Sleep(10 * time.Second)
	}
}

func getAppName(pidStr string) string {
	var pid int32
	fmt.Sscanf(pidStr, "%d", &pid)
	p, err := process.NewProcess(pid)
	if err != nil {
		return "Unknown"
	}
	name, _ := p.Name()
	return name
}

func classifyActivity(app, title string) string {
	appL := strings.ToLower(app)
	titleL := strings.ToLower(title)

	devApps := []string{"code", "powershell", "cmd", "wt", "pycharm", "cursor", "gh"}
	for _, a := range devApps {
		if strings.Contains(appL, a) {
			return "DEV"
		}
	}

	browsers := []string{"chrome", "msedge", "firefox", "brave"}
	for _, b := range browsers {
		if strings.Contains(appL, b) {
			if strings.Contains(titleL, "youtube") || strings.Contains(titleL, "netflix") {
				return "MEDIA"
			}
			return "BROWSING"
		}
	}

	games := []string{"steam", "valorant", "cs2", "minecraft"}
	for _, g := range games {
		if strings.Contains(appL, g) {
			return "GAMING"
		}
	}

	return "GENERAL"
}

func getProjectsString() string {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return "Erro ao abrir banco de dados."
	}
	defer db.Close()

	rows, err := db.Query("SELECT name, health_score FROM projects")
	if err != nil {
		return "Nenhum projeto encontrado ou erro na query."
	}
	defer rows.Close()

	var sb strings.Builder
	sb.WriteString("Projetos Ativos:\n\n")
	for rows.Next() {
		var name string
		var score float64
		rows.Scan(&name, &score)
		sb.WriteString(fmt.Sprintf("📂 %s - Saúde: %.0f%%\n", name, score))
	}
	return sb.String()
}

func listProjects() {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	rows, err := db.Query("SELECT name, path, health_score FROM projects")
	if err != nil {
		return
	}
	defer rows.Close()

	for rows.Next() {
		var name, path string
		var score float64
		rows.Scan(&name, &path, &score)
		fmt.Printf("📂 Projeto: %s (%s) - Saúde: %.0f%%\n", name, path, score)
	}
}
