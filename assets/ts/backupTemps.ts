/**
 * @file backupTemps.ts
 * @description Backup all "temp" folders
 *
 * @exports backupTemps
 */
import { copyDirWithDelete } from "./copyDirWithDelete.js";
import { glob } from "glob";
import { isIgnored } from "./isIgnored.js";
import path from "path";

/**
 * Backup all "temp" folders
 * @param {string} repos - The path to the repositories
 * @param {string} backupBase - The path to the backup location
 * @param {string} realHome - The real path to the home directory
 *
 * @returns Promise<void>
 */
async function backupTemps(
  repos: string,
  backupBase: string,
  realHome: string
): Promise<void> {
  const tempDirs = await glob(`${repos}/**/temp`, {
    windowsPathsNoEscape: true,
    nodir: false,
  });
  for (const tdir of tempDirs) {
    if (await isIgnored(tdir)) continue;
    const rel = path.relative(realHome, tdir);
    const btemp = path.join(backupBase, rel);
    console.log(`Backing up temp dir: ${tdir} → ${btemp}`);
    await copyDirWithDelete(tdir, btemp);
  }
}

export { backupTemps };
