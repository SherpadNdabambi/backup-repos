/**
 * @file findOrphanedBackups.ts
 * @description Module containing the findOrphanedBackups function
 *
 * @exports findOrphanedBackups
 */
import fsPromises from "fs/promises";
import path from "path";

/**
 * Recursively walk backup directory
 *
 * @param {string} dir - The path to the directory
 * @param {string} baseRel - The relative path to the directory
 *
 * @returns {Promise<void>} A promise that resolves when the cleanup is complete
 */
async function findOrphanedBackups(
  dir: string,
  baseRel = "",
  expectedRelPaths: Set<string>,
  orphanedFiles: string[] = []
) {
  const entries = await fsPromises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const rel = path.join(baseRel, entry.name).replace(/\\/g, "/");
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await findOrphanedBackups(full, rel, expectedRelPaths, orphanedFiles);
      // Remove empty directories after recursion
      const remaining = await fsPromises.readdir(full).catch(() => []);
      if (remaining.length === 0) {
        await fsPromises.rmdir(full);
        console.log(` Removed empty directory: ${rel}/`);
      }
    } else !expectedRelPaths.has(rel) && orphanedFiles.push(rel);
  }

  return orphanedFiles;
}

export { findOrphanedBackups };
