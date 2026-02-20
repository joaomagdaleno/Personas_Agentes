import winston from "winston";
const logger = winston.child({ module: "ImportHelpers" });

export class ImportHelpers {
    static applyProjectWideFixes(content: string, agentNames: string[], mapping: Record<string, string>): string {
        let res = content;
        for (const agent of agentNames) {
            const category = mapping[agent];
            const regex = new RegExp(`(from\\s+["'])([^"']*\/agents\/Support\/)(${agent})(\.ts)?(["'])`, "g");
            const checkAlreadyFixed = new RegExp(`\/agents\/Support\/${category}\/${agent}`, "g");
            if (regex.test(res) && !checkAlreadyFixed.test(res)) res = res.replace(regex, `$1$2${category}/$3$4$5`);
        }
        return res;
    }

    static fixSupportNeighbors(content: string, myCategory: string, agentNames: string[], mapping: Record<string, string>): string {
        let res = content;
        for (const otherAgent of agentNames) {
            const otherCategory = mapping[otherAgent];
            const otherRegex = new RegExp(`(from\\s+["']\.\/)(${otherAgent})(\.ts)?(["'])`, "g");
            if (otherRegex.test(res) && myCategory !== otherCategory) res = res.replace(otherRegex, `$1../${otherCategory}/$2$3$4`);
        }
        return res;
    }

    static fixExternalRelativeImports(content: string): string {
        let res = content;
        if (res.includes('from "../..')) res = res.replace(/(from\s+["']\.\.\/\.\.\/)([^"']+["'])/g, 'from "../../../$2');
        const coreUtilsRegex = /(from\s+["']\.\.\/)(core|utils|core|shared)([^"']+["'])/g;
        if (coreUtilsRegex.test(res)) res = res.replace(coreUtilsRegex, 'from "../../$2$3');
        return res;
    }
}
