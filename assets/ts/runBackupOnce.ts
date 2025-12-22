/**
 * @file runBackupOnce.ts
 * @description Module containing the runBackupOnce function
 *
 * @exports runBackupOnce
 */
import { backupTemps } from "./backupTemps.js";
import os from "os";
import path from "path";
import { processAllReposUnder } from "./processAllReposUnder.js";

/**
 * Runs a single backup pass on all provided paths.
 *
 * @param {string[]} paths - The paths to process
 * @param {string} backupLocationArg - The backup location argument
 *
 * @returns {Promise<void>} A promise that resolves when the backup is complete
 *
 * @remarks
 * This function will:
 *   1. Process all git repositories under each path for unpushed changes and
 *      backup them to the provided backup location.
 *   2. Backup all "temp" directories under each path to the same backup location.
 *   3. Log progress messages to the console.
 */
async function runBackupOnce(
  paths: string[],
  backupLocationArg: string
): Promise<void> {
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
  const REAL_HOME = os.homedir();
  const PLATFORM = os.platform();
  const BACKUP_BASE = path.join(
    backupLocationArg,
    "Repo Backup Tool Backups",
    PLATFORM,
    SAFE_HOME
  );

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
}

export { runBackupOnce };
