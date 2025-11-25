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
import { backupCmd } from "../../assets/ts/backupCmd";
import * as backupRepos from "../../assets/ts/backupRepos";

jest.mock("../../assets/ts/backupRepos");

describe("backupCmd", () => {
  const mockBackupRepos = jest.spyOn(backupRepos, "backupRepos");

  mockBackupRepos.mockImplementation(async () => {
    console.log("mocked backupRepos");
  });

  test("should call backupRepos with correct arguments", () => {
    backupCmd.parse(["backup/source1", "backup/destination"], { from: "user" });
    expect(mockBackupRepos).toHaveBeenCalledWith(
      ["backup/source1", "backup/destination"],
      expect.anything(),
      expect.anything()
    );
  });
});
