/**
 * @file copyDirWithDelete.ts
 * @description Cross-platform recursive directory copy with delete-old behavior
 *
 * @exports copyDirWithDelete
 */
import fspromises from "fs/promises";
import path from "path";
import { exists } from "./exists.js";

/**
 * Cross-platform recursive directory copy with delete-old behavior
 * @param {string} src - The source directory
 * @param {string} dst - The destination directory
 *
 * @returns Promise<void>
 */
async function copyDirWithDelete(src: string, dst: string): Promise<void> {
  // Ensure dest exists
  await fspromises.mkdir(dst, { recursive: true });

  // Copy everything new/changed
  await fspromises.cp(src, dst, {
    recursive: true,
    force: true,
    preserveTimestamps: true,
  });

  // Remove files that no longer exist in source (poor-man's --delete)
  const dstEntries = await fspromises.readdir(dst, { withFileTypes: true });
  for (const entry of dstEntries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (!(await exists(srcPath))) {
      await fspromises.rm(dstPath, { recursive: true, force: true });
    } else if (entry.isDirectory()) {
      await copyDirWithDelete(srcPath, dstPath); // recurse
    }
  }
}

export { copyDirWithDelete };
