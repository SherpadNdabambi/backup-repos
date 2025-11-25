/**
 * @file processAllReposUnder.ts
 * @description Process all git repositories under a parent directory
 *
 * @exports processAllReposUnder
 */
import { glob } from "glob";
import path from "path";
import { processRepo } from "./processRepo.js";

/**
 * Process all git repositories under a parent directory
 * @param {string} parent - The path to the parent directory
 * @param {string} backupBase - The path to the backup location
 * @param {string} realHome - The real path to the home directory
 *
 * @returns {Promise<void>}
 */
async function processAllReposUnder(
  parent: string,
  backupBase: string,
  realHome: string
): Promise<void> {
  try {
    // Cross-platform find all .git folders
    const gitDirs = await glob(`${parent}/**/.git`, {
      windowsPathsNoEscape: true,
    });
    const subRepos = gitDirs.map((g) => path.dirname(g));
    console.log(`Found ${subRepos.length} git repositories under ${parent}`);
    let processed = 0;
    for (const srepo of subRepos) {
      await processRepo(
        srepo,
        path.join(backupBase, path.relative(realHome, srepo))
      );
      processed++;
      console.log(`Processed ${processed}/${subRepos.length} repositories.`);
    }
  } catch (e) {
    console.error(
      `Error finding/processing repos under ${parent}:`,
      (e as Error).message
    );
  }
}

export { processAllReposUnder };
