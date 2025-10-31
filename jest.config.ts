// Jest configuration for running tests in a TypeScript project
export default {
  preset: "ts-jest", // Use ts-jest preset for TypeScript support
  testEnvironment: "node", // Run tests in a Node.js environment
  roots: ["<rootDir>/tests"], // Look for tests in the 'tests' directory
  testMatch: ["<rootDir>/tests/*.test.ts"], // Match files ending in .test.ts
  transform: {
    "^.+\\.ts$": "ts-jest", // Transform TypeScript files using ts-jest
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"], // Include Jest setup file
};
