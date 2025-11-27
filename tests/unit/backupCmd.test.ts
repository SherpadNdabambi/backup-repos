/**
 * @file backupCmd.test.ts
 * @description Unit tests for the backupCmd command that backs up git
 *              repositories under one or more paths with unpushed changes to a
 *              backup location.
 *
 * Test cases:
 *
 * @test {backupCmd} should call backupRepos with correct arguments
 */
import * as backupRepos from "../../assets/ts/backupRepos";
import { backupCmd } from "../../assets/ts/backupCmd";

jest.mock("../../assets/ts/backupRepos");

describe("backupCmd", () => {
  const mockBackupRepos = jest.spyOn(backupRepos, "backupRepos");

  mockBackupRepos.mockImplementation(async () => {});

  test("should call backupRepos with correct arguments", () => {
    backupCmd.parse(["backup/source1", "backup/destination"], { from: "user" });
    expect(mockBackupRepos).toHaveBeenCalledWith(
      ["backup/source1", "backup/destination"],
      expect.anything(),
      expect.anything()
    );
  });
});
