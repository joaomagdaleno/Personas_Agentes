package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"

	sitter "github.com/smacker/go-tree-sitter"
	golang "github.com/tree-sitter/tree-sitter-go/bindings/go"
	kotlin "github.com/tree-sitter-grammars/tree-sitter-kotlin/bindings/go"
	python "github.com/tree-sitter/tree-sitter-python/bindings/go"
	typescript "github.com/tree-sitter/tree-sitter-typescript/bindings/go"
)

type AtomicUnit struct {
	Type                string `json:"type"`
	Name                string `json:"name"`
	Line                int    `json:"line"`
	Complexity          int    `json:"complexity"`
	CognitiveComplexity int    `json:"cognitive_complexity"`
	Intent              string `json:"intent"`
}

type FileAnalysis struct {
	Path                string       `json:"path"`
	Exists              bool         `json:"exists"`
	Units               []AtomicUnit `json:"units"`
	TotalComplexity     int          `json:"total_complexity"`
	CognitiveComplexity int          `json:"cognitive_complexity"`
	MaxNesting          int          `json:"max_nesting"`
	Loc                 int          `json:"loc"`
	Sloc                int          `json:"sloc"`
	Comments            int          `json:"comments"`
	Intent              string       `json:"intent"`
}

var (
	metadataRegex      = regexp.MustCompile(`(?i)rules|patterns|regex|manifest|metadata|diretriz|heuristics`)
	observabilityRegex = regexp.MustCompile(`(?i)logger|log|console|telemetry|startMetrics|endMetrics|logPerformance|winston`)
	mathRegex          = regexp.MustCompile(`(?i)\b(alpha|progress|offset|dp|sp|x|y|width|height|radius|velocity|phase|lerp|sin|cos|tan|atan)\b`)
	infraRegex         = regexp.MustCompile(`(?i)fs\.|path\.|join\(|existsSync|readdir|readFile|Bun\.file|Bun\.spawn`)
)

func classifyIntent(content string) string {
	if metadataRegex.MatchString(content) {
		return "METADATA"
	}
	if observabilityRegex.MatchString(content) {
		return "OBSERVABILITY"
	}
	if mathRegex.MatchString(content) {
		return "TECH/MATH"
	}
	if infraRegex.MatchString(content) {
		return "INFRASTRUCTURE"
	}
	if strings.Contains(content, "ts.SyntaxKind") || strings.Contains(content, "ts.Node") || strings.Contains(content, "ast.") {
		return "AST/COMPILER"
	}
	return "LOGIC"
}

func getLanguage(ext string, isLegacy bool) *sitter.Language {
	if isLegacy {
		return sitter.NewLanguage(python.Language())
	}
	switch ext {
	case ".ts", ".tsx":
		return sitter.NewLanguage(typescript.LanguageTypescript())
	case ".js", ".jsx":
		return sitter.NewLanguage(typescript.LanguageTSX()) // TSX works for JS too usually
	case ".py":
		return sitter.NewLanguage(python.Language())
	case ".go":
		return sitter.NewLanguage(golang.Language())
	case ".kt":
		return sitter.NewLanguage(kotlin.Language())
	default:
		return nil
	}
}

func analyzeFile(path string, root string, isLegacy bool) (FileAnalysis, error) {
	rel, _ := filepath.Rel(root, path)
	rel = strings.ReplaceAll(rel, `\`, "/")

	content, err := os.ReadFile(path)
	if err != nil {
		return FileAnalysis{}, err
	}

	analysis := FileAnalysis{
		Path:   rel,
		Exists: true,
		Units:  []AtomicUnit{},
		Loc:    len(strings.Split(string(content), "\n")),
	}

	ext := filepath.Ext(path)
	lang := getLanguage(ext, isLegacy)
	if lang == nil {
		return analysis, nil
	}

	parser := sitter.NewParser()
	parser.SetLanguage(lang)

	tree, err := parser.ParseCtx(context.Background(), nil, content)
	if tree == nil {
		return analysis, fmt.Errorf("failed to parse file %s: %v", path, err)
	}
	rootNode := tree.RootNode()
	if rootNode == nil {
		return analysis, fmt.Errorf("failed to get root node for %s", path)
	}

	analysis.TotalComplexity = 0
	analysis.CognitiveComplexity = 0
	analysis.MaxNesting = 0
	analysis.Sloc = 0
	analysis.Comments = 0

	var walk func(*sitter.Node, int)
	walk = func(n *sitter.Node, nesting int) {
		if nesting > analysis.MaxNesting {
			analysis.MaxNesting = nesting
		}

		nodeType := n.Type()

		if strings.Contains(nodeType, "comment") {
			analysis.Comments++
		}

		isBranch := false
		isCognitiveIncrement := false
		isNestingIncrement := false

		switch nodeType {
		case "if_statement", "while_statement", "for_statement", "for_in_statement", "for_of_statement", "catch_clause", "conditional_expression", "if_expression", "when_expression":
			isBranch = true
			isCognitiveIncrement = true
			isNestingIncrement = true
		case "case_clause":
			isBranch = true
			isCognitiveIncrement = true
			// Case clauses usually don't increment nesting in Cognitive Complexity standard
		case "binary_expression":
			for i := 0; i < int(n.ChildCount()); i++ {
				child := n.Child(i)
				if child != nil && (child.Type() == "&&" || child.Type() == "||" || child.Type() == "??" || child.Type() == "and" || child.Type() == "or") {
					isBranch = true
					isCognitiveIncrement = true
					break
				}
			}
		}

		if isBranch {
			analysis.TotalComplexity++
		}

		if isCognitiveIncrement {
			cogWeight := 1 + nesting
			analysis.CognitiveComplexity += cogWeight
			if len(analysis.Units) > 0 {
				analysis.Units[len(analysis.Units)-1].CognitiveComplexity += cogWeight
			}
		}

		if isBranch && len(analysis.Units) > 0 {
			analysis.Units[len(analysis.Units)-1].Complexity++
		}

		// Unit identification
		nameNode := n.ChildByFieldName("name")
		if nameNode != nil {
			unitType := ""
			switch nodeType {
			case "class_declaration", "class_definition":
				unitType = "class"
			case "function_declaration", "function_definition", "method_definition", "method_declaration":
				unitType = "function"
			}

			if unitType != "" {
				analysis.Units = append(analysis.Units, AtomicUnit{
					Type:                unitType,
					Name:                string(content[nameNode.StartByte():nameNode.EndByte()]),
					Line:                int(n.StartPoint().Row) + 1,
					Complexity:          1,
					CognitiveComplexity: 0,
					Intent:              classifyIntent(string(content[n.StartByte():n.EndByte()])),
				})
			}
		}

		for i := 0; i < int(n.ChildCount()); i++ {
			nextNesting := nesting
			if isNestingIncrement || strings.Contains(nodeType, "declaration") || strings.Contains(nodeType, "definition") {
				nextNesting++
			}
			walk(n.Child(i), nextNesting)
		}
	}

	walk(rootNode, 0)
	analysis.TotalComplexity++     // Base cyclomatic complexity
	analysis.CognitiveComplexity++ // Base cognitive complexity
	analysis.Intent = classifyIntent(string(content))
	analysis.Sloc = analysis.Loc - analysis.Comments

	return analysis, nil
}

func main() {
	dirPtr := flag.String("dir", ".", "Directory to scan")
	rootPtr := flag.String("root", ".", "Root directory for relative paths")
	legacyPtr := flag.Bool("legacy", false, "Scan as legacy Python files")
	flag.Parse()

	var results = []FileAnalysis{}
	var mu sync.Mutex
	var wg sync.WaitGroup

	err := filepath.Walk(*dirPtr, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			if info != nil {
				name := info.Name()
				if name == "node_modules" || name == "__pycache__" || (strings.HasPrefix(name, ".") && name != ".") {
					return filepath.SkipDir
				}
			}
			return nil
		}

		ext := filepath.Ext(path)
		isCode := false
		if *legacyPtr && ext == ".py" {
			isCode = true
		} else if !*legacyPtr && (ext == ".ts" || ext == ".tsx" || ext == ".js" || ext == ".jsx" || ext == ".go" || ext == ".kt") {
			isCode = true
		}

		if isCode {
			if strings.Contains(path, "__init__") {
				return nil
			}

			wg.Add(1)
			go func(p string) {
				defer wg.Done()
				analysis, err := analyzeFile(p, *rootPtr, *legacyPtr)
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
		fmt.Fprintf(os.Stderr, "Error walking: %v\n", err)
		os.Exit(1)
	}

	wg.Wait()

	out, _ := json.Marshal(results)
	fmt.Println(string(out))
}
