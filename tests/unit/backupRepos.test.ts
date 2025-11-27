/**
 * @file backupRepos.test.ts
 * @description Unit tests for backupRepos
 */
import { backupRepos } from "../../assets/ts/backupRepos.js";
import * as backupTemps from "../../assets/ts/backupTemps.js";
import * as processAllReposUnder from "../../assets/ts/processAllReposUnder.js";
import os from "os";
import path from "path";

jest.mock("../../assets/ts/backupTemps.js");
jest.mock("../../assets/ts/processAllReposUnder.js");

// Save original process.argv so we can restore it after each test
const originalArgv = process.argv;

describe("backupRepos", () => {
  const mockBackupTemps = jest.mocked(backupTemps.backupTemps);
  const mockProcessAllReposUnder = jest.mocked(
    processAllReposUnder.processAllReposUnder
  );

  beforeEach(() => {
    jest.clearAllMocks();
    process.argv = [...originalArgv]; // reset argv
  });

  afterAll(() => {
    process.argv = originalArgv; // restore original
  });

  test("exits with error and prints usage when fewer than 2 paths + backup location are provided", async () => {
    process.argv = ["node", "cli.js", "backup"]; // only command

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });

    await expect(backupRepos()).rejects.toThrow("process.exit");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Usage: backup-repos backup <path1> [<path2> ...] <backup-location>"
    );
    expect(exitSpy).toHaveBeenCalledWith(1);

    consoleErrorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  test("correctly separates source paths from backup location", async () => {
    process.argv = [
      "node",
      "cli.js",
      "backup",
      "C:/repos/project1",
      "/home/me/projects",
      "/tmp/backup-dest",
    ];

    await backupRepos();

    const expectedPaths = ["C:/repos/project1", "/home/me/projects"];
    const expectedBackupLocation = "/tmp/backup-dest";

    // Verify processAllReposUnder is called with resolved paths
    expect(mockProcessAllReposUnder).toHaveBeenCalledTimes(
      expectedPaths.length
    );
    expectedPaths.forEach((p) => {
      expect(mockProcessAllReposUnder).toHaveBeenCalledWith(
        path.resolve(p),
        expect.any(String), // BACKUP_BASE
        os.homedir()
      );
    });

    // Verify backupTemps is called with same resolved paths
    expect(mockBackupTemps).toHaveBeenCalledTimes(expectedPaths.length);
    expectedPaths.forEach((p) => {
      expect(mockBackupTemps).toHaveBeenCalledWith(
        path.resolve(p),
        expect.any(String),
        os.homedir()
      );
    });

    // Verify BACKUP_BASE uses safe home path (no colon on Windows)
    const safeHome = os.homedir().replace(/^([A-Za-z]):/, "$1");
    const expectedBackupBase = path.join(
      expectedBackupLocation,
      "Backups",
      os.platform(),
      safeHome
    );

    expectedPaths.forEach(() => {
      expect(mockProcessAllReposUnder).toHaveBeenCalledWith(
        expect.any(String),
        expectedBackupBase,
        expect.any(String)
      );
      expect(mockBackupTemps).toHaveBeenCalledWith(
        expect.any(String),
        expectedBackupBase,
        expect.any(String)
      );
    });
  });

  test("processes single source path correctly", async () => {
    process.argv = ["node", "cli.js", "backup", "D:/code", "/mnt/backups"];

    await backupRepos();

    expect(mockProcessAllReposUnder).toHaveBeenCalledTimes(1);
    expect(mockProcessAllReposUnder).toHaveBeenCalledWith(
      path.resolve("D:/code"),
      expect.stringContaining(path.join("/mnt/backups", "Backups")),
      os.homedir()
    );

    expect(mockBackupTemps).toHaveBeenCalledTimes(1);
    expect(mockBackupTemps).toHaveBeenCalledWith(
      path.resolve("D:/code"),
      expect.stringContaining(path.join("/mnt/backups", "Backups")),
      os.homedir()
    );
  });

  test("logs expected messages during normal execution", async () => {
    process.argv = ["node", "cli.js", "backup", "~/projects", "/backup/drive"];

    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

    await backupRepos();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("Starting backup process for paths:")
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("Backup base:")
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("Processing repos under")
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("Backing up temp directories")
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Temp directories backup completed."
    );

    consoleLogSpy.mockRestore();
  });

  test("catches and logs errors from backupTemps without crashing", async () => {
    process.argv = ["node", "cli.js", "backup", "/src", "/dest"];

    const error = new Error("Temp backup failed");
    mockBackupTemps.mockRejectedValueOnce(error);

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    await backupRepos();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error backing up temps:",
      "Temp backup failed"
    );

    consoleErrorSpy.mockRestore();
  });
});
