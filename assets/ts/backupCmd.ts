/**
 * @file backupRepos.ts
 * @description Command for backing up git repositories
 *
 * @exports backupCmd
 */
import { backupRepos } from "./backupRepos.js";
import { Command } from "commander";

const backupCmd = new Command()
  .action(backupRepos as BackupCmdAction)
  .allowExcessArguments(false)
  .arguments("<paths...>")
  .description(
    "Backs up git repositories under one or more paths with unpushed changes to a backup location."
  )
  .name("backup")
  .option(
    "-w, --watch",
    "Watch for changes to source files and back them up automatically."
  );

type BackupCmdAction = (paths: string[], cmd: Command) => Promise<void>;

export { backupCmd };
