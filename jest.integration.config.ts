// Jest configuration for running tests in a TypeScript project
export default {
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  }, // strip .js extensions added by tsc -- only for Jest
  preset: "ts-jest", // Use ts-jest preset for TypeScript support
  // Integration tests – fast, fully mocked, no real FS
  roots: ["<rootDir>/tests/integration"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"], // Include Jest setup file
  testEnvironment: "node", // Run tests in a Node.js environment
  testMatch: ["<rootDir>/tests/integration/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest", // Transform TypeScript files using ts-jest
  },
};
