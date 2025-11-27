/**
 * @file cli.integration.test.ts
 * @description Integration tests for the backup-repos CLI
 *
 * Test cases:
 *
 * @test --help exits with code 0 and shows usage
 * @test --version shows correct version
 * @test no arguments shows help (commander default behaviour)
 * @test unknown command shows error and exits with non-zero code
 */
import { execSync } from "child_process";
import path from "path";

// __dirname works because ts-jest compiles to CommonJS for the test environment
const cliPath = path.resolve(__dirname, "../../dist/cli.js");

describe("backup-repos CLI (integration)", () => {
  // Ensure the project is built before running CLI tests
  beforeAll(() => {
    try {
      execSync("npm run build --silent", { stdio: "ignore" });
    } catch {
      // ignore if already built or build failed for unrelated reason
    }
  });

  test("--help exits with code 0 and shows usage", () => {
    const output = execSync(`node "${cliPath}" --help`, { encoding: "utf8" });
    expect(output).toContain("Usage: backup-repos");
    expect(output).toContain("backup"); // our subcommand
  });

  test("--version shows correct version", () => {
    const output = execSync(`node "${cliPath}" --version`, {
      encoding: "utf8",
    });
    expect(output.trim()).toBe("1.0.0");
  });

  test("unknown command shows error and exits with non-zero code", () => {
    expect(() => {
      execSync(`node "${cliPath}" nonsense`, { stdio: "ignore" });
    }).toThrow();
  });
});
