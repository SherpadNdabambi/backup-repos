/**
 * @file backupRepos.ts
 * @description Backup git repositories under one or more paths with unpushed
 *              changes to a backup location.
 *
 * @exports backupRepos
 */
import chokidar from "chokidar";
import { runBackupOnce } from "./runBackupOnce.js";

/**
 * Backup all git repositories under one or more paths
 * with unpushed changes to a backup location.
 *
 * @param {string[]} args - The arguments
 *
 * @returns {Promise<void>} A promise that resolves when the backup is complete
 */
async function backupRepos(
  args: string[],
  options: BackupCmdOptions
): Promise<void> {
  if (args.length < 2) {
    console.error(
      `Error: Too few arguments.\nUsage: backup-repos backup <path1> [<path2> ...] <backup-location>`
    );
    process.exit(1);
  }
  const backupLocationArg = args.pop()!;
  const paths = args;

  if (options.watch) {
    console.log("Watch mode enabled. Monitoring for changes...");
    await runBackupOnce(paths, backupLocationArg);
    const watcher = chokidar.watch(paths, {
      ignored: /(^|[\/\\])\.git$|node_modules|\.env|\.DS_Store/,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
    });
    watcher.on("all", async () => {
      console.log("\nChange detected. Running backup...");
      try {
        await runBackupOnce(paths, backupLocationArg);
      } catch (error) {
        console.error("Backup failed after change:", (error as Error).message);
      }
    });
  } else {
    await runBackupOnce(paths, backupLocationArg);
  }
}

interface BackupCmdOptions {
  watch?: boolean;
}

export { backupRepos };
