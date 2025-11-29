/**
 * @file processRepo.unit.test.ts
 * @description Unit tests for processRepo
 *
 * Test cases:
 *
 * @test {processRepo} should
 */
import * as existsModule from "../../assets/ts/exists.js";
import * as shellModule from "../../assets/ts/shell.js";
import fs, { PathLike } from "fs";
import fspromises from "fs/promises";
import path from "path";
import { processRepo } from "../../assets/ts/processRepo.js";

// -----------------------------------------------------------------------------
// Mocks
// -----------------------------------------------------------------------------
jest.mock("../../assets/ts/exists.js");
jest.mock("../../assets/ts/shell.js");
jest.mock("fs");
jest.mock("fs/promises");
jest.mock("path");

// -----------------------------------------------------------------------------
// Test suite
// -----------------------------------------------------------------------------
describe("processRepo", () => {
  const backupRepo = "/backup",
    mockedCopyFile = jest.spyOn(fspromises, "copyFile"),
    mockedExists = jest.spyOn(existsModule, "exists"),
    mockedFsExistsSync = jest.spyOn(fs, "existsSync"),
    mockedMkdir = jest.spyOn(fspromises, "mkdir"),
    mockedPathDirname = jest.spyOn(path, "dirname"),
    mockedPathJoin = jest.spyOn(path, "join"),
    mockedPathRelative = jest.spyOn(path, "relative"),
    mockedRm = jest.spyOn(fspromises, "rm"),
    mockedStat = jest.spyOn(fspromises, "stat"),
    mockedShell = jest.spyOn(shellModule, "shell"),
    repoPath = "/repo";

  beforeEach(() => {
    jest.clearAllMocks();

    // Default path mocks – behave exactly like the real path module
    mockedPathJoin.mockImplementation((...args: string[]) => args.join("/"));
    mockedPathDirname.mockImplementation((p: string) => {
      const dir = p.split("/").slice(0, -1).join("/") || "/";
      return dir === "" ? "/" : dir;
    });
    mockedPathRelative.mockImplementation((from: string, to: string) =>
      to.replace(from, "")
    );

    // fs/promises defaults
    mockedStat.mockResolvedValue({ mtime: new Date("2024-01-02") } as fs.Stats);
    mockedMkdir.mockResolvedValue(undefined);
    mockedRm.mockResolvedValue(undefined);
    // The real shell() always returns { stdout: string, stderr?: string }
    // Some call sites only destructure stdout – they crash when we return undefined
    mockedShell.mockImplementation(() => {
      // Will be overridden per test – provide a safe default
      return Promise.resolve({ stdout: "", stderr: "" });
    });
  });

  // -----------------------------------------------------------------------

  test("creates backup directory and skips copy when no remote/upstream exists", async () => {
    // Arrange
    mockedShell
      .mockResolvedValueOnce({ stdout: "", stderr: "" }) // git remote -> no remote
      .mockResolvedValueOnce({
        stdout: "some tracked files\0another.txt\0",
        stderr: "",
      })
      .mockResolvedValueOnce({ stdout: "untracked.txt\0", stderr: "" });

    mockedExists.mockResolvedValue(false);
    mockedFsExistsSync.mockReturnValue(true);

    // Act
    await processRepo(repoPath, backupRepo);

    // Assert
    expect(mockedMkdir).toHaveBeenCalledWith(backupRepo, { recursive: true });
    expect(mockedCopyFile).toHaveBeenCalledWith(
      "/repo/some tracked files",
      "/backup/some tracked files"
    );
    expect(mockedCopyFile).toHaveBeenCalledWith(
      "/repo/another.txt",
      "/backup/another.txt"
    );
    expect(mockedCopyFile).toHaveBeenCalledWith(
      "/repo/untracked.txt",
      "/backup/untracked.txt"
    );
  });

  test("backs up only changed files when remote+upstream exist", async () => {
    // Arrange
    mockedShell
      .mockResolvedValueOnce({ stdout: "origin", stderr: "" }) // git remote -> has remote
      .mockResolvedValueOnce({ stdout: "", stderr: "" }) // rev-parse @{u} succeeds -> has upstream
      .mockResolvedValueOnce({
        stdout: `
M	src/index.ts
A	src/new.ts
R	src/renamed.ts	src/renamed2.ts
        `.trim(),
        stderr: "",
      });

    mockedExists.mockResolvedValue(false);
    mockedFsExistsSync.mockReturnValue(true);

    // Act
    await processRepo(repoPath, backupRepo);

    // Assert
    expect(mockedCopyFile).toHaveBeenCalledTimes(3); // M + A + R (origin file)
    expect(mockedCopyFile).toHaveBeenCalledWith(
      "/repo/src/new.ts",
      "/backup/src/new.ts"
    );
    expect(mockedCopyFile).toHaveBeenCalledWith(
      "/repo/src/index.ts",
      "/backup/src/index.ts"
    );
    expect(mockedCopyFile).toHaveBeenCalledWith(
      "/repo/src/renamed.ts",
      "/backup/src/renamed2.ts"
    );

    expect(mockedRm).toHaveBeenCalledWith("/backup/src/old.ts", {
      force: true,
    });
  });

  test("skips copy when destination file is newer or same mtime", async () => {
    // Arrange
    mockedShell
      .mockResolvedValueOnce({ stdout: "origin", stderr: "" })
      .mockResolvedValueOnce({ stdout: "", stderr: "" })
      .mockResolvedValueOnce({ stdout: "M\tpackage.json", stderr: "" });

    mockedExists.mockResolvedValue(true);

    // src is older than dst
    mockedStat
      .mockResolvedValueOnce({ mtime: new Date("2024-01-01") } as fs.Stats) // src
      .mockResolvedValueOnce({ mtime: new Date("2024-01-03") } as fs.Stats); // dst

    // Act
    await processRepo(repoPath, backupRepo);

    // Assert - copy should be skipped
    expect(mockedCopyFile).not.toHaveBeenCalled();
  });

  test("deletes files from backup that no longer exist in repo (no upstream case)", async () => {
    // Arrange - no upstream
    // 1. git remote → empty
    // 2. git ls-files -z → only one tracked file that really exists
    // 3. git ls-files --others … → no untracked files
    mockedShell
      .mockResolvedValueOnce({ stdout: "", stderr: "" }) // no remote
      .mockResolvedValueOnce({ stdout: "exists.txt\0", stderr: "" })
      .mockResolvedValueOnce({ stdout: "", stderr: "" });

    // Simulate that every file *except* exists.txt does NOT exist on disk
    // → processRepo will push it into filesToDelete
    mockedFsExistsSync.mockImplementation((p: PathLike) => {
      const str = p.toString();
      return str.includes("exists.txt");
    });

    // One file already present in backup but no longer in repo → must be deleted
    mockedExists.mockResolvedValue(true);

    // Act
    await processRepo(repoPath, backupRepo);

    // Assert
    expect(mockedRm).toHaveBeenCalled();
  });

  test("handles renamed files correctly in diff output", async () => {
    mockedShell
      .mockResolvedValueOnce({ stdout: "origin", stderr: "" })
      .mockResolvedValueOnce({ stdout: "", stderr: "" })
      .mockResolvedValueOnce({
        stdout: "R95\told-name.ts\tnew-name.ts",
        stderr: "",
      });

    mockedExists.mockResolvedValue(false);
    mockedFsExistsSync.mockImplementation(
      (path: PathLike): boolean => !path.toString().includes("exists.txt")
    ); // only exists.txt is present

    // Act
    await processRepo(repoPath, backupRepo);

    // Assert - non-existent tracked files trigger delete in backup
    expect(mockedRm).toHaveBeenCalled();
  });

  test("handles renamed files correctly in diff output", async () => {
    mockedShell
      .mockResolvedValueOnce({ stdout: "origin", stderr: "" })
      .mockResolvedValueOnce({ stdout: "", stderr: "" })
      .mockResolvedValueOnce({
        stdout: "R90\told-name.ts\tnew-name.ts",
        stderr: "",
      });

    mockedExists.mockResolvedValue(false);
    mockedFsExistsSync.mockReturnValue(true);

    await processRepo(repoPath, backupRepo);

    expect(mockedCopyFile).toHaveBeenCalledWith(
      "/repo/old-name.ts",
      "/backup/new-name.ts"
    );
  });
});
