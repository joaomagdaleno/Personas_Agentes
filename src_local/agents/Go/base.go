
package agents

import (
	"context"
	"fmt"
)

type AuditFinding struct {
	File     string `json:"file"`
	Line     int    `json:"line"`
	Issue    string `json:"issue"`
	Severity string `json:"severity"`
}

type ProjectContext struct {
	Map map[string]interface{}
	Hub interface{} // To be defined as RuleProviderClient
}

type BasePersona struct {
	ID    string
	Name  string
	Emoji string
	Role  string
	Stack string
	Hub   interface{}
}

func (p *BasePersona) SetContext(hub interface{}) {
	p.Hub = hub
}

// In a real scenario, this would call the gRPC client
func (p *BasePersona) DelegateAuditToHub(ctx context.Context, personaID string, stack string, content string) ([]AuditFinding, error) {
	fmt.Printf("📡 Delegating audit for %s (%s) to Hub PhD...\n", personaID, stack)
	return nil, nil
}
