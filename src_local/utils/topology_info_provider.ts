import { GitClient } from "./git_client.ts";
import { Path } from "../core/path_utils.ts";

/**
 * 📊 TopologyInfoProvider — Helper for retrieving submodule topology.
 */
export class TopologyInfoProvider {
    static async get(git: GitClient, agentPath: Path): Promise<{ path: string, remote: string | null, branch: string | null }[]> {
        try {
            const remote = await git.discoverRemote();
            const branch = await git.getCurrentBranch();
            return [{ path: agentPath.toString(), remote, branch }];
        } catch {
            return [{ path: agentPath.toString(), remote: null, branch: null }];
        }
    }
}
