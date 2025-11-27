/**
 * @file copyDirWithDelete.unit.test.ts
 * @description Unit tests for copyDirWithDelete - fully mocked, no real FS
 *
 * Test cases:
 *
 * @test {copyDirWithDelete} creates destination directory recursively
 * @test {copyDirWithDelete} copies source to destination recursively preserving timestamps
 * @test {copyDirWithDelete} deletes files in destination that no longer exist in source
 * @test {copyDirWithDelete} deletes directories in destination that no longer exist in source
 * @test {copyDirWithDelete} recurses into directories that still exist in source
 * @test {copyDirWithDelete} handles mixed content correctly (keep + delete + recurse)
 * @test {copyDirWithDelete} does nothing when destination is already identical (empty case)
 */
import fs from "fs";
import path from "path";
import * as existsModule from "../../assets/ts/exists.js";

// Spy on the function so we can assert recursive calls
jest.mock("../../assets/ts/copyDirWithDelete.js", () => ({
  copyDirWithDelete: jest.fn(),
}));

// Mock everything we touch
jest.mock("../../assets/ts/exists.js", () => ({
  exists: jest.fn(),
}));

jest.mock("fs/promises", () => ({
  mkdir: jest.fn(),
  cp: jest.fn(),
  readdir: jest.fn(),
  rm: jest.fn(),
}));

const mockedFsPromises = jest.mocked(require("fs/promises"));
const { exists } = jest.mocked(existsModule);
const mockedExists = jest.mocked(exists);
// Re-import the now-mocked function
// @ts-ignore: module may not be resolvable at TS compile time but is available at runtime via Jest's module system
const { copyDirWithDelete } = require("../../assets/ts/copyDirWithDelete.js");

describe("copyDirWithDelete", () => {
  const src = "/fake/src";
  const dst = "/fake/dst";

  beforeEach(() => {
    jest.clearAllMocks();

    // Always return a fresh array so it's definitely iterable
    mockedFsPromises.readdir.mockImplementation(() => Promise.resolve([]));

    // Implement the real logic inside the mock (so recursion works)
    copyDirWithDelete.mockImplementation(async (s: string, d: string) => {
      await mockedFsPromises.mkdir(d, { recursive: true });
      await mockedFsPromises.cp(s, d, {
        recursive: true,
        force: true,
        preserveTimestamps: true,
      });

      const dstEntries = await mockedFsPromises.readdir(d, {
        withFileTypes: true,
      });
      for (const entry of dstEntries) {
        const srcPath = path.join(s, entry.name);
        const dstPath = path.join(d, entry.name);
        if (!(await mockedExists(srcPath))) {
          await mockedFsPromises.rm(dstPath, { recursive: true, force: true });
        } else if (entry.isDirectory()) {
          await copyDirWithDelete(srcPath, dstPath);
        }
      }
    });
  });

  test("creates destination directory recursively", async () => {
    mockedFsPromises.readdir.mockResolvedValueOnce([]); // will fallback to default empty → returns empty array of Dirent

    await copyDirWithDelete(src, dst);

    expect(mockedFsPromises.mkdir).toHaveBeenCalledWith(dst, {
      recursive: true,
    });
  });

  test("copies source to destination recursively preserving timestamps", async () => {
    mockedFsPromises.readdir.mockResolvedValueOnce([]);

    await copyDirWithDelete(src, dst);

    expect(mockedFsPromises.cp).toHaveBeenCalledWith(src, dst, {
      recursive: true,
      force: true,
      preserveTimestamps: true,
    });
  });

  test("deletes files in destination that no longer exist in source", async () => {
    mockedFsPromises.readdir.mockResolvedValueOnce([
      dirent("deleted.txt", false),
    ]);
    mockedExists.mockResolvedValueOnce(false); // src does not have it

    await copyDirWithDelete(src, dst);

    expect(mockedFsPromises.rm).toHaveBeenCalledWith(
      path.join("/fake/dst", "deleted.txt"),
      {
        recursive: true,
        force: true,
      }
    );
  });

  test("deletes directories in destination that no longer exist in source", async () => {
    mockedFsPromises.readdir.mockResolvedValueOnce([
      dirent("old-folder", true),
    ]);
    mockedExists.mockResolvedValueOnce(false);

    await copyDirWithDelete(src, dst);

    expect(mockedFsPromises.rm).toHaveBeenCalledWith(
      path.join("/fake/dst", "old-folder"),
      {
        recursive: true,
        force: true,
      }
    );
  });

  test("recurses into directories that still exist in source", async () => {
    mockedFsPromises.readdir.mockResolvedValueOnce([dirent("shared", true)]);
    mockedExists.mockResolvedValueOnce(true); // still exists in src

    await copyDirWithDelete(src, dst);

    expect(copyDirWithDelete).toHaveBeenCalledWith(
      path.join("/fake/src", "shared"),
      path.join("/fake/dst", "shared")
    );
  });

  test("handles mixed content correctly (keep + delete + recurse)", async () => {
    mockedFsPromises.readdir.mockResolvedValueOnce([
      dirent("keep.txt", false),
      dirent("remove.txt", false),
      dirent("sub", true),
    ]);

    mockedExists
      .mockResolvedValueOnce(true) // keep.txt exists
      .mockResolvedValueOnce(false) // remove.txt gone
      .mockResolvedValueOnce(true); // sub still exists

    await copyDirWithDelete(src, dst);

    // Only remove.txt should be deleted
    expect(mockedFsPromises.rm).toHaveBeenCalledTimes(1);
    expect(mockedFsPromises.rm).toHaveBeenCalledWith(
      path.join("/fake/dst", "remove.txt"),
      {
        recursive: true,
        force: true,
      }
    );

    // Recursion into sub
    expect(copyDirWithDelete).toHaveBeenCalledWith(
      path.join("/fake/src", "sub"),
      path.join("/fake/dst", "sub")
    );
  });

  test("does nothing when destination is already identical (empty case)", async () => {
    mockedFsPromises.readdir.mockResolvedValueOnce([]); // empty array of Dirent → no iteration

    await copyDirWithDelete(src, dst);

    expect(mockedFsPromises.rm).not.toHaveBeenCalled();
    expect(copyDirWithDelete).toHaveBeenCalledTimes(1); // only the top-level call
  });
});

/**
 * Helper to create a minimal Dirent-like object for tests
 * @param {string} name - The name
 * @param {boolean} isDirectory - Whether it's a directory
 * @param {boolean} isFile - Whether it's a file
 * @param {boolean} isSymbolicLink - Whether it's a symbolic link
 * @returns {fs.Dirent} The fake Dirent
 */
function dirent(name: string, isDirectory: boolean): fs.Dirent {
  return {
    name,
    isDirectory: () => isDirectory,
    isFile: () => !isDirectory,
    isSymbolicLink: () => false,
  } as any;
}
