import { Command } from "commander";
import { exec } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

async function backupTemps(
  repos: string,
  backupBase: string,
  home: string
): Promise<void> {
  const { stdout: tempsOut } = await shell(
    `find "${repos}" -type d -name temp -print0`
  );
  const tempDirs = tempsOut
    .trim()
    .split("\0")
    .filter((d) => d);
  for (const tdir of tempDirs) {
    if (await isIgnored(tdir)) continue;

    const rel = path.relative(home, tdir);
    const btemp = path.join(backupBase, rel);
    await shell(`mkdir -p "${btemp}"`);
    await shell(`rsync -avu --delete "${tdir}/" "${btemp}/"`);
  }
}

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

async function backupRepos(): Promise<void> {
  const args = process.argv.slice(3);

  if (args.length < 2) {
    console.error(
      "Usage: backup-repos backup <path1> [<path2> ...] <backup-location>"
    );
    process.exit(1);
  }

  const backupLocationArg = args.pop()!;
  const paths = args;

  const HOME = process.env.HOME || "";
  const PLATFORM = os.platform();
  const BACKUP_BASE = path.join(backupLocationArg, "Backups", PLATFORM, HOME);

  try {
    console.log(`Starting backup process for paths: ${paths.join(", ")}`);
    console.log(`Backup base: ${BACKUP_BASE}`);

    for (const pathArg of paths) {
      const resolvedPath = path.resolve(pathArg);
      console.log(`\n--- Processing repos under '${resolvedPath}' ---`);
      await processAllReposUnder(resolvedPath, BACKUP_BASE, HOME);
    }

    console.log("\n--- Backing up temp directories ---");
    for (const pathArg of paths) {
      await backupTemps(path.resolve(pathArg), BACKUP_BASE, HOME);
    }
    console.log("Temp directories backup completed.");
  } catch (e) {
    console.error("Error backing up temps:", (e as Error).message);
  }
}

async function processAllReposUnder(
  parent: string,
  backupBase: string,
  home: string
): Promise<void> {
  try {
    const { stdout: gitdirsOut } = await shell(
      `find "${parent}" -name .git -type d`
    );
    const subRepos = gitdirsOut
      .trim()
      .split("\n")
      .filter((g) => g)
      .map((g) => path.dirname(g));
    console.log(`Found ${subRepos.length} git repositories under ${parent}`);
    let processed = 0;
    for (const srepo of subRepos) {
      await processRepo(
        srepo,
        path.join(backupBase, path.relative(home, srepo))
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

async function processRepo(
  repoPath: string,
  backupRepo: string
): Promise<void> {
  await shell(`mkdir -p "${backupRepo}"`, { cwd: repoPath });

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
    await shell(`rm -f "${bFile}"`);
  }

  // Perform copies
  for (const { src, dst } of filesToCopy) {
    let shouldCopy = true;
    if (fs.existsSync(dst)) {
      try {
        const srcStat = fs.statSync(src);
        const dstStat = fs.statSync(dst);
        if (srcStat.mtime <= dstStat.mtime) {
          console.log(
            `  Skipping: ${path.relative(repoPath, src)} (no newer changes)`
          );
          shouldCopy = false;
        }
      } catch (statError) {
        console.warn(
          `  Warning: Could not stat ${src} or ${dst}: ${statError}`
        );
        // Proceed with copy if stat fails
      }
    }
    if (!shouldCopy) continue;

    console.log(`  Copying: ${path.relative(repoPath, src)}`);
    const dir = path.dirname(dst);
    await shell(`mkdir -p "${dir}"`);
    await shell(`cp "${src}" "${dst}"`);
  }
}

async function shell(
  cmd: string,
  opts: { cwd?: string } = {}
): Promise<ShellResult> {
  return new Promise((resolve, reject) => {
    exec(cmd, opts, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

interface ShellResult {
  stdout: string;
  stderr: string;
}

const backupCmd = new Command()
  .action(backupRepos)
  .arguments("<paths...>")
  .allowExcessArguments(false)
  .description(
    "Backs up git repositories under one or more paths with unpushed changes to a backup location."
  )
  .name("backup");

export { backupCmd, backupRepos };
