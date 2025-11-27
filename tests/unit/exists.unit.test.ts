/**
 * @file exists.unit.test.ts
 * @description Unit tests for exists
 *
 * Test cases:
 *
 * @test {exists} returns true when file exists
 * @test {exists} returns false when file does not exist
 */
import { exists } from "../../assets/ts/exists.js";
import * as fsPromises from "fs/promises";

jest.mock("fs/promises", () => ({
  access: jest.fn(),
}));

const mockedAccess = jest.mocked(fsPromises.access);

describe("exists", () => {
  test("returns true when file exists", async () => {
    mockedAccess.mockResolvedValueOnce();

    const result = await exists("/fake/path");

    expect(result).toBe(true);
  });

  test("returns false when file does not exist", async () => {
    mockedAccess.mockRejectedValueOnce(new Error("ENOENT"));

    const result = await exists("/fake/path");

    expect(result).toBe(false);
  });
});
