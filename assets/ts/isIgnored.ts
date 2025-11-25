/**
 * @file isIgnored.ts
 * @description Check if a directory is ignored by git
 *
 * @exports isIgnored
 */
import fs from "fs";
import path from "path";
import { shell } from "./shell.js";

/**
 * Check if a directory is ignored by git
 * @param {string} dir - The path to the directory
 *
 * @returns {Promise<boolean>} True if the directory is ignored
 */
async function isIgnored(dir: string): Promise<boolean> {
  let gitRoot = dir;
  while (gitRoot !== path.parse(gitRoot).root) {
    if (fs.existsSync(path.join(gitRoot, ".git"))) {
      break;
    }
    gitRoot = path.dirname(gitRoot);
  }
  if (!fs.existsSync(path.join(gitRoot, ".git"))) {
    return false;
  }
  const relPath = path.relative(gitRoot, dir).replace(/\\/g, "/");
  try {
    await shell(`git -C "${gitRoot}" check-ignore -q "${relPath}"`);
    return true; // code 0: ignored
  } catch (e) {
    return false; // code 1 or error: not ignored
  }
}

export { isIgnored };
