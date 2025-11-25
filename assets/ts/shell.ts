/**
 * @file shell.ts
 * @description Cross-platform shell command execution
 *
 * @exports shell
 */
import { exec } from "child_process";

/**
 * Execute shell command
 * @param {string} cmd - Command
 * @param {string} opts.cwd - Working directory
 * @returns {Promise<ShellResult>} Shell result
 */
async function shell(
  cmd: string,
  opts: { cwd?: string } = {}
): Promise<ShellResult> {
  return new Promise((resolve, reject) => {
    exec(
      cmd,
      {
        ...opts,
        windowsHide: true,
        shell: process.platform === "win32" ? "cmd.exe" : undefined,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      }
    );
  });
}

interface ShellResult {
  stdout: string;
  stderr: string;
}

export { shell };
