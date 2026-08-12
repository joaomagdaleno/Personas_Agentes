import winston from "winston";

const logger = winston.child({ module: "NeuralSubsystemService" });

export class Value {
    data: number; grad: number = 0;
    private _prev: Set<Value>; private _op: string;
    constructor(data: number, children: Value[] = [], op: string = "") {
        this.data = data; this._prev = new Set(children); this._op = op;
    }
    add(other: Value | number): Value {
        const o = typeof other === "number" ? new Value(other) : other;
        return new Value(this.data + o.data, [this, o], "+");
    }
    mul(other: Value | number): Value {
        const o = typeof other === "number" ? new Value(other) : other;
        return new Value(this.data * o.data, [this, o], "*");
    }
    tanh(): Value {
        const t = Math.tanh(this.data);
        return new Value(t, [this], "tanh");
    }
    backward(): void {
        const topo: Value[] = []; const visited = new Set<Value>();
        const build = (v: Value) => {
            if (!visited.has(v)) { visited.add(v); for (const child of v._prev) build(child); topo.push(v); }
        };
        build(this); this.grad = 1.0;
        for (const node of topo.reverse()) {
            if (node._op === "+") {
                const children = Array.from(node._prev);
                if (children[0]) children[0].grad += node.grad;
                if (children[1]) children[1].grad += node.grad;
            } else if (node._op === "*") {
                const children = Array.from(node._prev);
                if (children[0] && children[1]) {
                    children[0].grad += children[1].data * node.grad;
                    children[1].grad += children[0].data * node.grad;
                }
            } else if (node._op === "tanh") {
                const children = Array.from(node._prev);
                if (children[0]) children[0].grad += (1 - node.data * node.data) * node.grad;
            }
        }
    }
}

export class Neuron {
    w: Value[]; b: Value;
    constructor(nin: number) {
        this.w = Array.from({ length: nin }, () => new Value((Math.random() * 2 - 1) * 0.1));
        this.b = new Value(0);
    }
    forward(x: Value[]): Value {
        let act = this.b;
        for (let i = 0; i < this.w.length; i++) {
            if (this.w[i] && x[i]) act = act.add(this.w[i].mul(x[i]));
        }
        return act.tanh();
    }
    parameters(): Value[] { return [...this.w, this.b]; }
}

export class Layer {
    neurons: Neuron[];
    constructor(nin: number, nout: number) {
        this.neurons = Array.from({ length: nout }, () => new Neuron(nin));
    }
    forward(x: Value[]): Value[] { return this.neurons.map(n => n.forward(x)); }
    parameters(): Value[] { return this.neurons.flatMap(n => n.parameters()); }
}

export class MLP {
    layers: Layer[];
    constructor(nin: number, nouts: number[]) {
        const sz = [nin, ...nouts];
        this.layers = Array.from({ length: nouts.length }, (_, i) => new Layer(sz[i]!, sz[i + 1]!));
    }
    forward(x: Value[]): Value[] {
        let out = x;
        for (const layer of this.layers) out = layer.forward(out);
        return out;
    }
    parameters(): Value[] { return this.layers.flatMap(l => l.parameters()); }
}

export class MicroGPTPredictor {
    mlp: MLP;
    private eventMap: Map<string, number> = new Map();
    private reverseMap: Map<number, string> = new Map();
    private vocabSize: number;

    constructor() {
        const events = ["PIPELINE_START", "DISCOVERY_PHASE_START", "DISCOVERY_FINDINGS", "CENSUS_VALIDATION", "COGNITIVE_AUDIT", "AUTO_HEAL_ATTEMPT", "AUTO_HEAL_SUCCESS", "VALIDATION_PHASE", "METRICS_GENERATED", "PIPELINE_FINISHED"];
        events.forEach((ev, idx) => { this.eventMap.set(ev, idx); this.reverseMap.set(idx, ev); });
        this.vocabSize = events.length;
        this.mlp = new MLP(this.vocabSize, [16, 16, this.vocabSize]);
    }

    private oneHot(idx: number): Value[] {
        return Array.from({ length: this.vocabSize }, (_, i) => new Value(i === idx ? 1.0 : 0.0));
    }

    predictNextLogits(sequence: string[]): number[] {
        if (sequence.length === 0) return Array(this.vocabSize).fill(0);
        const lastEv = sequence[sequence.length - 1]!;
        const idx = this.eventMap.get(lastEv);
        if (idx === undefined) return Array(this.vocabSize).fill(0);
        const x = this.oneHot(idx);
        const logits = this.mlp.forward(x);
        return logits.map(v => v.data);
    }

    predictNextEvent(sequence: string[]): string | null {
        const logits = this.predictNextLogits(sequence);
        let maxIdx = 0; let maxVal = -Infinity;
        logits.forEach((val, i) => { if (val > maxVal) { maxVal = val; maxIdx = i; } });
        return this.reverseMap.get(maxIdx) || null;
    }

    train(sequences: string[][], epochs: number = 50, lr: number = 0.05): void {
        const pairs: Array<{ inIdx: number, outIdx: number }> = [];
        for (const seq of sequences) {
            for (let i = 0; i < seq.length - 1; i++) {
                const inId = this.eventMap.get(seq[i]!);
                const outId = this.eventMap.get(seq[i + 1]!);
                if (inId !== undefined && outId !== undefined) pairs.push({ inIdx: inId, outIdx: outId });
            }
        }
        if (pairs.length === 0) return;
        for (let epoch = 0; epoch < epochs; epoch++) {
            let totalLoss = 0;
            for (const p of this.mlp.parameters()) p.grad = 0;
            for (const pair of pairs) {
                const x = this.oneHot(pair.inIdx);
                const logits = this.mlp.forward(x);
                let sumExp = new Value(0);
                for (const l of logits) sumExp = sumExp.add(new Value(Math.exp(l.data)));
                const targetLogit = logits[pair.outIdx]!;
                const loss = new Value(Math.log(sumExp.data) - targetLogit.data);
                totalLoss += loss.data;
                loss.backward();
            }
            for (const p of this.mlp.parameters()) p.data -= lr * (p.grad / pairs.length);
        }
    }
    exportWeights(): number[] { return this.mlp.parameters().map(p => p.data); }
    importWeights(weights: number[]): void {
        const params = this.mlp.parameters();
        weights.forEach((w, i) => { if (params[i]) params[i].data = w; });
    }
}

export class PredictorEngine {
    private predictor: MicroGPTPredictor;
    private currentSequence: string[] = [];
    private projectRoot: string;
    private trainingHistory: string[][] = [];

    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
        this.predictor = new MicroGPTPredictor();
        if (!this.loadWeights()) this.loadOrSeedTrainingData();
    }
    public recordEvent(eventName: string): void {
        const validEvents = ["PIPELINE_START", "DISCOVERY_PHASE_START", "DISCOVERY_FINDINGS", "CENSUS_VALIDATION", "COGNITIVE_AUDIT", "AUTO_HEAL_ATTEMPT", "AUTO_HEAL_SUCCESS", "VALIDATION_PHASE", "METRICS_GENERATED", "PIPELINE_FINISHED"];
        if (validEvents.includes(eventName)) this.currentSequence.push(eventName);
    }
    public evaluateCurrentFlow(): number {
        if (this.currentSequence.length < 2) return 0;
        const seqCopy = [...this.currentSequence];
        const actualNext = seqCopy.pop()!;
        const logits = this.predictor.predictNextLogits(seqCopy);
        let sumExp = 0; logits.forEach(l => sumExp += Math.exp(l));
        const events = ["PIPELINE_START", "DISCOVERY_PHASE_START", "DISCOVERY_FINDINGS", "CENSUS_VALIDATION", "COGNITIVE_AUDIT", "AUTO_HEAL_ATTEMPT", "AUTO_HEAL_SUCCESS", "VALIDATION_PHASE", "METRICS_GENERATED", "PIPELINE_FINISHED"];
        const actualIdx = events.indexOf(actualNext);
        if (actualIdx === -1) return 2.0;
        const prob = Math.exp(logits[actualIdx]!) / Math.max(1e-5, sumExp);
        return -Math.log(Math.max(1e-5, prob));
    }
    public learnCurrentSequence(): void {
        if (this.currentSequence.length >= 3) {
            this.trainingHistory.push([...this.currentSequence]);
            const iters = process.env.NODE_ENV === "test" || process.env.BUN_ENV === "test" ? 1 : 20;
            this.predictor.train([[...this.currentSequence]], iters, 0.02);
            this.saveWeights();
        }
    }
    public clearCurrentSequence(): void { this.currentSequence = []; }
    private saveWeights(): void {
        try {
            const { writeFileSync, mkdirSync, existsSync } = require("fs");
            const dir = `${this.projectRoot}/.gemini`;
            if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
            writeFileSync(`${dir}/microgpt_weights.json`, JSON.stringify(this.predictor.exportWeights()));
        } catch {}
    }
    private loadWeights(): boolean {
        try {
            const { existsSync, readFileSync } = require("fs");
            const p = `${this.projectRoot}/.gemini/microgpt_weights.json`;
            if (existsSync(p)) { this.predictor.importWeights(JSON.parse(readFileSync(p, "utf-8"))); return true; }
        } catch {}
        return false;
    }
    private loadOrSeedTrainingData(): void {
        const base = ["PIPELINE_START", "DISCOVERY_PHASE_START", "DISCOVERY_FINDINGS", "CENSUS_VALIDATION", "COGNITIVE_AUDIT", "VALIDATION_PHASE", "METRICS_GENERATED", "PIPELINE_FINISHED"];
        const heal = ["PIPELINE_START", "DISCOVERY_PHASE_START", "DISCOVERY_FINDINGS", "CENSUS_VALIDATION", "COGNITIVE_AUDIT", "AUTO_HEAL_ATTEMPT", "AUTO_HEAL_SUCCESS", "VALIDATION_PHASE", "METRICS_GENERATED", "PIPELINE_FINISHED"];
        for (let i = 0; i < 5; i++) this.trainingHistory.push([...base]);
        for (let i = 0; i < 3; i++) this.trainingHistory.push([...heal]);
        const iters = process.env.NODE_ENV === "test" || process.env.BUN_ENV === "test" ? 1 : 150;
        this.predictor.train(this.trainingHistory, iters, 0.05);
    }
    public getSanityMetrics(): { score: number, status: string, label: string } {
        const score = this.evaluateCurrentFlow();
        let status = "Healthy", label = "✅ Sanidade Neural Nominal";
        if (score > 1.5) { status = "Suspicious"; label = "⚠️ Fluxo Não-Convencional Detectado"; }
        if (score > 3.0) { status = "Anomaly"; label = "🚨 Anomalia Sequencial Crítica"; }
        return { score, status, label };
    }
}

export class MicroGPT {
    vocab: string[] = [];
    weights: number[][] = [];

    constructor(vocabSize: number = 256) {
        this.vocab = Array.from({ length: vocabSize }, (_, i) => String.fromCharCode(i));
    }

    forward(inputIds: number[]): number[] {
        return inputIds.map(id => (id * 31) % this.vocab.length);
    }
}

export class NeuralSubsystemService {
    private model: MicroGPT;

    constructor() {
        this.model = new MicroGPT();
    }

    public generateThought(prompt: string): string {
        logger.info("🧠 [NeuralSubsystem] Processando vetor de pensamento...");
        const tokens = Array.from(prompt).map(c => c.charCodeAt(0));
        const logits = this.model.forward(tokens);
        return `[Neural Thought] Output Vector Size: ${logits.length}`;
    }
}
