/**
 * @file backupTemps.test.ts
 * @description Unit tests for backupTemps
 *
 * Test cases:
 *
 * @test {backupTemps} calls copyDirWithDelete for each temp directory
 */
import * as copyDirWithDelete from "../../assets/ts/copyDirWithDelete.js";
import * as isIgnored from "../../assets/ts/isIgnored.js";
import { backupTemps } from "../../assets/ts/backupTemps.js";
import { glob } from "glob";
import path from "path";

jest.mock("../../assets/ts/copyDirWithDelete.js");
jest.mock("../../assets/ts/isIgnored.js");
jest.mock("glob", () => ({
  glob: jest.fn(),
}));

describe("backupTemps", () => {
  const mockCopyDirWithDelete = jest.spyOn(
      copyDirWithDelete,
      "copyDirWithDelete"
    ),
    mockIsIgnored = jest.spyOn(isIgnored, "isIgnored");

  beforeEach(() => {
    (glob as jest.MockedFunction<typeof glob>).mockResolvedValue([
      "/repos/projectA/temp",
      "/repos/projectB/temp",
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  mockCopyDirWithDelete.mockImplementation(async () => {});
  mockIsIgnored.mockImplementation(async () => false);

  test("calls copyDirWithDelete for each temp directory", async () => {
    const repos = "/repos",
      backupBase = "/backup",
      realHome = "/home";
    await backupTemps(repos, backupBase, realHome);
    expect(mockCopyDirWithDelete).toHaveBeenCalledTimes(2);
    expect(mockCopyDirWithDelete).toHaveBeenCalledWith(
      "/repos/projectA/temp",
      expect.stringContaining(path.join("repos", "projectA", "temp"))
    );
    expect(mockCopyDirWithDelete).toHaveBeenCalledWith(
      "/repos/projectB/temp",
      expect.stringContaining(path.join("repos", "projectB", "temp"))
    );
  });
});
