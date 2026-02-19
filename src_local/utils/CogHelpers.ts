/**
 * 🟦 CogHelpers - PhD in AI Connectivity
 */
export class CogHelpers {
    static getParams(o: any, def: number) {
        return {
            temperature: o.temperature || 0.7,
            num_predict: o.max_tokens || def
        };
    }

    static async callOllama(ep: string, body: any) {
        const response = await fetch(ep, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        return response.ok ? await response.json() : null;
    }

    static async unloadModel(ep: string, model: string) {
        try {
            await fetch(ep, {
                method: "POST",
                body: JSON.stringify({ model, keep_alive: 0 })
            });
            return true;
        } catch { return false; }
    }
}
