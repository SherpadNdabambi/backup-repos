#!/usr/bin/env node

import { backupCmd } from "./backupCmd.js";
import { Command } from "commander";

const program = new Command()
  .description("A script to scan repos for unpushed changes and back them up.")
  .name("repo-backup-tool-cli")
  .version("2.0.0");

program.addCommand(backupCmd);

program.parse();
