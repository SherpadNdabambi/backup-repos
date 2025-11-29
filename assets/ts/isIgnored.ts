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
 * @param {Partial<Dependencies>} deps - Optional dependencies for testing
 *
 * @returns {Promise<boolean>} True if the directory is ignored
 */
async function isIgnored(
  dir: string,
  deps: Partial<Dependencies> = {}
): Promise<boolean> {
  const {
    fs: f = fs,
    path: p = path,
    shell: s = shell,
  } = { ...defaultDeps, ...deps };

  let gitRoot = dir;
  while (gitRoot !== p.parse(gitRoot).root) {
    if (f.existsSync(p.join(gitRoot, ".git"))) {
      break;
    }

    gitRoot = p.dirname(gitRoot);
  }

  if (!f.existsSync(p.join(gitRoot, ".git"))) {
    return false;
  }

  const relPath = p.relative(gitRoot, dir).replace(/\\/g, "/");
  try {
    await s(`git -C "${gitRoot}" check-ignore -q "${relPath}"`);

    return true; // code 0: ignored
  } catch (e) {
    // git check-ignore exits with 1 when NOT ignored → expected
    if ((e as any)?.code === 1) return false;
    throw e; // unexpected error
  }
}

// Injectables for testing
type Dependencies = {
  fs: typeof fs;
  path: typeof path;
  shell: typeof shell;
};

const defaultDeps: Dependencies = { fs, path, shell };

export { isIgnored };
