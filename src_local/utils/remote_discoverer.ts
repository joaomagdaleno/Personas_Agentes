import { GitClient } from "./git_client.ts";

/**
 * 🛰️ RemoteDiscoverer — Helper for identifying the best remote.
 */
export class RemoteDiscoverer {
    static async discover(git: GitClient): Promise<string | null> {
        const output = await git.getOutput(["remote"]);
        const remotes = output.split("\n").map(r => r.trim());

        const targets = ["upstream", "origin"];
        for (const r of targets) {
            if (remotes.includes(r) && await this.isHeadsReady(git, r)) {
                return r;
            }
        }
        return remotes.length > 0 ? (remotes[0] as string) : null;
    }

    private static async isHeadsReady(git: GitClient, remote: string): Promise<boolean> {
        const res = await git.run(["ls-remote", "--heads", remote]);
        return res.exitCode === 0;
    }
}
