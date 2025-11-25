/**
 * @file processRepo.ts
 * @description Process a single git repository
 *
 * @exports processRepo
 */
import { exists } from "./exists.js";
import fs from "fs";
import fspromises from "fs/promises";
import path from "path";
import { shell } from "./shell.js";

/**
 * eslint-disable-next-line @typescript-eslint/no-unused-vars
 *
 * @param {string} repoPath - The path to the repository
 * @param {string} backupRepo - The path to the backup location
 *
 * @returns {Promise<void>}
 */
async function processRepo(
  repoPath: string,
  backupRepo: string
): Promise<void> {
  await fspromises.mkdir(backupRepo, { recursive: true });

  const { stdout: remotesOut } = await shell("git remote", { cwd: repoPath });
  const hasRemote = remotesOut.trim() !== "";

  let filesToCopy: { src: string; dst: string }[] = [];
  let filesToDelete: string[] = [];
  console.log(`\nProcessing repo: ${repoPath}`);
  console.log(`  Backup location: ${backupRepo}`);

  const upstream = "@{u}";
  let hasUpstream = false;
  try {
    await shell(`git rev-parse --verify ${upstream}`, { cwd: repoPath });
    hasUpstream = true;
  } catch (e) {
    hasUpstream = false;
  }

  if (hasRemote && hasUpstream) {
    const { stdout: diffOut } = await shell(
      `git diff --name-status ${upstream}`,
      { cwd: repoPath }
    );
    const lines = diffOut.trim().split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      const parts = line.split("\t");
      const status = parts[0];
      const file = parts.slice(1).join("\t");
      const fullFile = path.join(repoPath, file);
      const bFile = path.join(backupRepo, file);
      if (status === "D") {
        filesToDelete.push(bFile);
      } else if (status === "M" || status === "A") {
        if (fs.existsSync(fullFile)) {
          filesToCopy.push({ src: fullFile, dst: bFile });
        }
      }
    }
  } else {
    // No remote or no upstream: backup all non-ignored files (tracked + untracked non-ignored)
    console.log(
      `  No upstream remote; backing up all tracked/untracked files.`
    );
    const { stdout: trackedOut } = await shell("git ls-files -z", {
      cwd: repoPath,
    });
    const trackedFiles = trackedOut
      .trim()
      .split("\0")
      .filter((f) => f);
    for (const file of trackedFiles) {
      const fullFile = path.join(repoPath, file);
      const bFile = path.join(backupRepo, file);
      if (fs.existsSync(fullFile)) {
        filesToCopy.push({ src: fullFile, dst: bFile });
      } else {
        filesToDelete.push(bFile);
      }
    }
    const { stdout: untrackedOut } = await shell(
      "git ls-files --others --exclude-standard -z",
      { cwd: repoPath }
    );
    const untrackedFiles = untrackedOut
      .trim()
      .split("\0")
      .filter((f) => f);
    for (const file of untrackedFiles) {
      const fullFile = path.join(repoPath, file);
      const bFile = path.join(backupRepo, file);
      filesToCopy.push({ src: fullFile, dst: bFile });
    }
  }
  console.log(
    `  Files to copy: ${filesToCopy.length}, Files to delete: ${filesToDelete.length}`
  );

  // Perform deletes
  for (const bFile of filesToDelete) {
    await fspromises.rm(bFile, { force: true });
  }

  // Perform copies (with mtime check)
  for (const { src, dst } of filesToCopy) {
    let shouldCopy = true;
    if (await exists(dst)) {
      const srcStat = await fspromises.stat(src);
      const dstStat = await fspromises.stat(dst);
      if (srcStat.mtime <= dstStat.mtime) {
        console.log(
          ` Skipping: ${path.relative(repoPath, src)} (no newer changes)`
        );
        shouldCopy = false;
      }
    }
    if (!shouldCopy) continue;

    console.log(` Copying: ${path.relative(repoPath, src)}`);
    await fspromises.mkdir(path.dirname(dst), { recursive: true });
    await fspromises.copyFile(src, dst);
  }
}

export { processRepo };
