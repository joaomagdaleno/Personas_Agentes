import { Value } from './microgpt_core.ts';

/**
 * 🧮 ModelOps — Basic operations for the neural engine.
 */
export class ModelOps {
    static linear(x: Value[], w: Value[][]): Value[] {
        return Value.matmul(x, w);
    }

    static softmax(logits: Value[]): Value[] {
        const maxVal = Math.max(...logits.map((v) => v.data));
        const exps = logits.map((v) => v.sub(maxVal).exp());
        const total = exps.reduce((a, b) => a.add(b));
        return exps.map((e) => e.div(total));
    }

    static rmsnorm(x: Value[]): Value[] {
        const ms = x
            .reduce((acc, xi) => acc.add(xi.mul(xi)), new Value(0))
            .div(x.length);
        const scale = ms.add(1e-5).pow(-0.5);
        return x.map((xi) => xi.mul(scale));
    }
}
