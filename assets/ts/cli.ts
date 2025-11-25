#!/usr/bin/env node

import { backupCmd } from "./backupCmd.js";
import { Command } from "commander";

const program = new Command()
  .description("A script to scan repos for unpushed changes and back them up.")
  .name("backup-repos")
  .version("1.0.0");

program.addCommand(backupCmd);

program.parse();
