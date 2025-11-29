/**
 * @file processAllReposUnder.unit.test.ts
 * @description Unit tests for processAllReposUnder
 *
 * Test cases:
 *
 * @test {processAllReposUnder} should call processRepo for each subrepository
 */
import * as processRepoModule from "../../assets/ts/processRepo.js";
import * as globModule from "glob";
import path from "path";
import { processAllReposUnder } from "../../assets/ts/processAllReposUnder.js";

jest.mock("../../assets/ts/processRepo.js");
jest.mock("glob", () => ({
  glob: jest.fn(),
}));
jest.mock("path");

// Test suite for processAllReposUnder
describe("processAllReposUnder", () => {
  test("should call processRepo for each subrepository", async () => {
    const mockedDirname = jest.spyOn(path, "dirname"),
      mockedGlob = jest.spyOn(globModule, "glob"),
      mockedJoin = jest.spyOn(path, "join"),
      mockedProcessRepo = jest.spyOn(processRepoModule, "processRepo");

    mockedDirname
      .mockReturnValueOnce("/repos/projectA")
      .mockReturnValueOnce("/repos/projectB");

    mockedGlob.mockResolvedValue([
      "/repos/projectA/.git",
      "/repos/projectB/.git",
    ]);

    mockedJoin
      .mockReturnValueOnce("/repos/projectA")
      .mockReturnValueOnce("/repos/projectB");

    mockedProcessRepo.mockResolvedValue();

    await processAllReposUnder("/repos", "/backup", "/home");
    expect(mockedProcessRepo).toHaveBeenCalledWith(
      "/repos/projectA",
      "/repos/projectA"
    );
    expect(mockedProcessRepo).toHaveBeenCalledWith(
      "/repos/projectB",
      "/repos/projectB"
    );
  });
});
