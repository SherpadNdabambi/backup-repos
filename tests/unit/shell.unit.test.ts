/**
 * @file shell.unit.test.ts
 * @description Unit tests for shell
 *
 * Test cases:
 *
 * @test {shell} should resolve with stdout/stderr on success
 * @test {shell} should reject with the error when exec fails
 * @test {shell} should use default options when none provided
 */
import { exec } from "child_process";
import { shell } from "../../assets/ts/shell";

// Mock the entire child_process module
jest.mock("child_process", () => ({
  exec: jest.fn(),
}));

const mockedExec = exec as jest.MockedFunction<typeof exec>;

describe("shell()", () => {
  beforeEach(() => {
    mockedExec.mockClear();
  });

  test("should resolve with stdout/stderr on success", async () => {
    mockedExec.mockImplementation((cmd, opts, callback) => {
      // Simulate async exec callback
      setImmediate(() => callback!(null, "hello\nworld", ""));
      return {} as any;
    });

    const result = await shell("git status", { cwd: "/tmp" });

    expect(result).toEqual({ stdout: "hello\nworld", stderr: "" });
    expect(mockedExec).toHaveBeenCalledWith(
      "git status",
      {
        cwd: "/tmp",
        windowsHide: true,
        shell: process.platform === "win32" ? "cmd.exe" : undefined,
      },
      expect.any(Function)
    );
  });

  test("should reject with the error when exec fails", async () => {
    const nodeError = new Error("permission denied") as Error & {
      code?: number;
    };
    nodeError.code = 126;

    mockedExec.mockImplementation((cmd, opts, callback) => {
      setImmediate(() =>
        callback!(nodeError, "", "bash: git: command not found")
      );
      return {} as any;
    });

    await expect(shell("git something-weird")).rejects.toThrow(
      "permission denied"
    );
  });

  test("should use default options when none provided", async () => {
    mockedExec.mockImplementation((cmd, opts, callback) => {
      setImmediate(() => callback!(null, "", ""));
      return {} as any;
    });

    await shell("echo test");

    expect(mockedExec).toHaveBeenCalledWith(
      "echo test",
      {
        windowsHide: true,
        shell: process.platform === "win32" ? "cmd.exe" : undefined,
      },
      expect.any(Function)
    );
  });
});
