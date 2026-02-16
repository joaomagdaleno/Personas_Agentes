package main

import (
	"encoding/json"
	"fmt"
	"sort"
	"time"

	"github.com/shirou/gopsutil/v4/cpu"
	"github.com/shirou/gopsutil/v4/mem"
	"github.com/shirou/gopsutil/v4/process"
)

type ProcessInfo struct {
	Name  string  `json:"name"`
	PID   int32   `json:"pid"`
	MemMB float64 `json:"mem_mb"`
	CPU   float64 `json:"cpu_percent"`
}

type SystemHealth struct {
	CPUUsage     float64       `json:"cpu_usage"`
	MemoryUsage  float64       `json:"memory_usage"`
	MemoryFreeGB float64       `json:"memory_free_gb"`
	HeavyProcess []ProcessInfo `json:"heavy_processes"`
	Timestamp    int64         `json:"timestamp"`
}

func main() {
	health := SystemHealth{
		Timestamp: time.Now().Unix(),
	}

	// 1. CPU Usage
	percentages, err := cpu.Percent(time.Second, false)
	if err == nil && len(percentages) > 0 {
		health.CPUUsage = percentages[0]
	}

	// 2. Memory Info
	v, err := mem.VirtualMemory()
	if err == nil {
		health.MemoryUsage = v.UsedPercent
		health.MemoryFreeGB = float64(v.Free) / (1024 * 1024 * 1024)
	}

	// 3. Heavy Processes
	procs, _ := process.Processes()
	var heavyProcs []ProcessInfo

	for _, p := range procs {
		name, _ := p.Name()
		memInfo, _ := p.MemoryInfo()
		cpuPerc, _ := p.CPUPercent()

		if memInfo != nil {
			memMB := float64(memInfo.RSS) / (1024 * 1024)
			// Filter: > 150MB RAM or > 5% CPU
			if memMB > 150 || cpuPerc > 5 {
				heavyProcs = append(heavyProcs, ProcessInfo{
					Name:  name,
					PID:   p.Pid,
					MemMB: memMB,
					CPU:   cpuPerc,
				})
			}
		}
	}

	// Sort by Memory Usage
	sort.Slice(heavyProcs, func(i, j int) bool {
		return heavyProcs[i].MemMB > heavyProcs[j].MemMB
	})

	// Limit to top 10
	if len(heavyProcs) > 10 {
		heavyProcs = heavyProcs[:10]
	}
	health.HeavyProcess = heavyProcs

	// Output JSON
	out, _ := json.MarshalIndent(health, "", "  ")
	fmt.Println(string(out))
}
