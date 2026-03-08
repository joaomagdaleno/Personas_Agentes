package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
)

var (
	intentRegexes = map[string]*regexp.Regexp{
		"METADATA":       regexp.MustCompile(`(?i)rules|patterns|regex|manifest|metadata|diretriz|heuristics`),
		"OBSERVABILITY":  regexp.MustCompile(`(?i)logger|log|console|telemetry|winston`),
		"TECH/MATH":      regexp.MustCompile(`(?i)\b(alpha|progress|offset|lerp|sin|cos|tan)\b`),
		"INFRASTRUCTURE": regexp.MustCompile(`(?i)fs\.|path\.|join\(|existsSync|readdir|readFile`),
	}
)

type FileAnalysis struct {
	Path     string `json:"path"`
	Exists   bool   `json:"exists"`
	Loc      int    `json:"loc"`
	Sloc     int    `json:"sloc"`
	Comments int    `json:"comments"`
	Intent   string `json:"intent"`
}

func analyzeFile(path string, root string) (FileAnalysis, error) {
	rel, _ := filepath.Rel(root, path)
	rel = strings.ReplaceAll(rel, `\`, "/")

	contentBytes, err := os.ReadFile(path)
	if err != nil {
		return FileAnalysis{}, err
	}
	content := string(contentBytes)
	lines := strings.Split(content, "\n")

	analysis := FileAnalysis{
		Path:   rel,
		Exists: true,
		Loc:    len(lines),
	}

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}
		if strings.HasPrefix(trimmed, "//") || strings.HasPrefix(trimmed, "/*") || strings.HasPrefix(trimmed, "*") {
			analysis.Comments++
			continue
		}
		analysis.Sloc++
	}

	analysis.Intent = "LOGIC"
	for intent, re := range intentRegexes {
		if re.MatchString(content) {
			analysis.Intent = intent
			break
		}
	}

	return analysis, nil
}

func main() {
	dirPtr := flag.String("dir", "", "Directory to scan")
	filePtr := flag.String("file", "", "Specific file to scan")
	rootPtr := flag.String("root", ".", "Root directory for relative paths")
	flag.Parse()

	if *filePtr != "" {
		analysis, err := analyzeFile(*filePtr, *rootPtr)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error: %v\n", err)
			os.Exit(1)
		}
		out, _ := json.Marshal([]FileAnalysis{analysis})
		fmt.Println(string(out))
		return
	}

	if *dirPtr == "" {
		flag.Usage()
		os.Exit(1)
	}

	var results = []FileAnalysis{}
	var mu sync.Mutex
	var wg sync.WaitGroup

	err := filepath.Walk(*dirPtr, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			if info != nil {
				name := info.Name()
				if name == "node_modules" || strings.HasPrefix(name, ".") && name != "." {
					return filepath.SkipDir
				}
			}
			return nil
		}

		ext := filepath.Ext(path)
		if ext == ".ts" || ext == ".tsx" || ext == ".js" || ext == ".py" || ext == ".go" {
			wg.Add(1)
			go func(p string) {
				defer wg.Done()
				analysis, err := analyzeFile(p, *rootPtr)
				if err == nil {
					mu.Lock()
					results = append(results, analysis)
					mu.Unlock()
				}
			}(path)
		}
		return nil
	})

	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}

	wg.Wait()
	out, _ := json.Marshal(results)
	fmt.Println(string(out))
}
