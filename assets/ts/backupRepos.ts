/**
 * @file backupRepos.ts
 * @description Backup git repositories under one or more paths with unpushed
 *              changes to a backup location.
 *
 * @exports backupRepos
 */
import { backupTemps } from "./backupTemps.js";
import os from "os";
import path from "path";
import { processAllReposUnder } from "./processAllReposUnder.js";

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
      `Error: Too few arguments.
Usage: backup-repos backup <path1> [<path2> ...] <backup-location>`
    );
    process.exit(1);
  }

  const backupLocationArg = args.pop()!;
  const paths = args;

  /**
   * HOME on Windows is something like: C:\Users\Username, but we don't want
   * colons in path. We still want the backup to preserve the full original
   * path structure, including the drive letter on Windows: C\Users\Username\..
   * So we convert "C:\Users\Username" -> "C\Users\Username" (safe in path)
   * Examples:
   * Windows -> "C\Users\Username"
   * Linux/macOS -> "/home/username" (unchanged, no colon)
   */
  const SAFE_HOME = os.homedir().replace(/^([A-Za-z]):/, "$1");

  // For path.relative we need the real path with drive letter + backslashes
  const REAL_HOME = os.homedir();

  // Debugging: display REAL_HOME and SAFE_HOME
  console.log(`Real home: ${REAL_HOME} -> Safe home segment: ${SAFE_HOME}`);

  const PLATFORM = os.platform();
  const BACKUP_BASE = path.join(
    backupLocationArg,
    "Backups",
    PLATFORM,
    SAFE_HOME
  );

  try {
    console.log(`Starting backup process for paths: ${paths.join(", ")}`);
    console.log(`Backup base: ${BACKUP_BASE}`);

    for (const pathArg of paths) {
      const resolvedPath = path.resolve(pathArg);
      console.log(`\n--- Processing repos under '${resolvedPath}' ---`);
      await processAllReposUnder(resolvedPath, BACKUP_BASE, REAL_HOME);
    }

    console.log("\n--- Backing up temp directories ---");
    for (const pathArg of paths) {
      await backupTemps(path.resolve(pathArg), BACKUP_BASE, REAL_HOME);
    }
    console.log("Temp directories backup completed.");
  } catch (e) {
    console.error("Error backing up temps:", (e as Error).message);
  }
}

interface BackupCmdOptions {
  watch?: boolean;
}

export { backupRepos };
