export class Value {
    data: number;
    grad: number = 0;
    private _children: Value[];
    private _localGrads: number[];

    constructor(data: number, children: Value[] = [], localGrads: number[] = []) {
        this.data = data;
        this._children = children;
        this._localGrads = localGrads;
    }

    add(other: Value | number): Value {
        const o = other instanceof Value ? other : new Value(other);
        return new Value(this.data + o.data, [this, o], [1, 1]);
    }

    mul(other: Value | number): Value {
        const o = other instanceof Value ? other : new Value(other);
        return new Value(this.data * o.data, [this, o], [o.data, this.data]);
    }

    pow(n: number): Value {
        return new Value(this.data ** n, [this], [n * this.data ** (n - 1)]);
    }

    log(): Value {
        return new Value(Math.log(this.data), [this], [1 / this.data]);
    }

    exp(): Value {
        return new Value(Math.exp(this.data), [this], [Math.exp(this.data)]);
    }

    relu(): Value {
        return new Value(Math.max(0, this.data), [this], [this.data > 0 ? 1 : 0]);
    }

    neg(): Value {
        return this.mul(-1);
    }

    sub(other: Value | number): Value {
        const o = other instanceof Value ? other : new Value(other);
        return this.add(o.neg());
    }

    div(other: Value | number): Value {
        const o = other instanceof Value ? other : new Value(other);
        return this.mul(o.pow(-1));
    }

    backward(): void {
        const topo = this.buildTopo();
        this.grad = 1;
        this.propagateGradients(topo);
    }

    private propagateGradients(topo: Value[]) {
        for (let i = topo.length - 1; i >= 0; i--) {
            const v = topo[i]!;
            v._children.forEach((child, j) => {
                child.grad += v._localGrads[j]! * v.grad;
            });
        }
    }

    private buildTopo(): Value[] {
        const topo: Value[] = [], visited = new Set<Value>(), processed = new Set<Value>();
        const stack: Value[] = [this];

        while (stack.length > 0) {
            const v = stack[stack.length - 1]!;
            if (visited.has(v)) {
                stack.pop();
                if (!processed.has(v)) { processed.add(v); topo.push(v); }
                continue;
            }
            visited.add(v);
            v._children.forEach(c => { if (!visited.has(c)) stack.push(c); });
        }
        return topo;
    }

    /**
     * Matrix multiplication helper for a vector and a matrix.
     * x: vector [n], w: matrix [m, n] -> output [m]
     */
    static matmul(x: Value[], w: Value[][]): Value[] {
        return w.map(row => {
            let sum = new Value(0);
            for (let i = 0; i < x.length; i++) {
                sum = sum.add(x[i]!.mul(row[i]!));
            }
            return sum;
        });
    }
}
