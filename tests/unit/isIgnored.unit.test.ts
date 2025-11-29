/**
 * @file isIgnored.unit.test.ts
 * @description Unit tests for isIgnored
 *
 * Test cases:
 *
 * @test {isIgnored} should return true if the directory is ignored
 * @test {isIgnored} should return false if the directory is not ignored
 */
// tests/unit/isIgnored.unit.test.ts

import { isIgnored } from "../../assets/ts/isIgnored.js";
import path from "path";
import fs, { existsSync } from "fs";

describe("isIgnored", () => {
  const fakeShell = jest.fn(),
    mockedExistsSync = jest.spyOn(fs, "existsSync") as jest.MockedFunction<
      typeof fs.existsSync
    >,
    deps = {
      fs: {
        existsSync: mockedExistsSync,
      },
      path: {
        parse: path.parse,
        dirname: path.dirname,
        relative: path.relative,
        join: path.join,
      },
      shell: fakeShell,
    } as unknown as Required<Parameters<typeof isIgnored>[1]>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return true if the directory is ignored", async () => {
    mockedExistsSync.mockReturnValue(true);
    // git check-ignore exits 0 → ignored
    fakeShell.mockResolvedValueOnce({ code: 0 });

    const result = await isIgnored("/some/repo/subdir", deps);

    expect(result).toBe(true);
  });

  test("should return false if the directory is not ignored", async () => {
    mockedExistsSync.mockReturnValue(true);
    // git check-ignore exits 1 → not ignored
    fakeShell.mockRejectedValueOnce({ code: 1 });

    const result = await isIgnored("/some/repo/subdir", deps);

    expect(result).toBe(false);
  });

  test("should return false if no .git directory is found", async () => {
    mockedExistsSync.mockReturnValue(false);

    const result = await isIgnored("/some/place", deps);

    expect(fakeShell).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
