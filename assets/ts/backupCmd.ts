/**
 * @file backupRepos.ts
 * @description Command for backing up git repositories
 *
 * @exports backupCmd
 */
import { backupRepos } from "./backupRepos.js";
import { Command } from "commander";

const backupCmd = new Command()
  .action(backupRepos)
  .arguments("<paths...>")
  .allowExcessArguments(false)
  .description(
    "Backs up git repositories under one or more paths with unpushed changes to a backup location."
  )
  .name("backup");

export { backupCmd };
