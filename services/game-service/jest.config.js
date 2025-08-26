/* eslint-env node */

module.exports = {
  preset: 'ts-jest', // Use ts-jest for TypeScript support
  testEnvironment: 'node', // Test environment for Node.js
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'], // Where Jest looks for test files
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverage: true, // Optional: Collect test coverage
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/dist/',
    '/types/', // Usually no logic to cover in types files
    '/config/', // Usually no logic to cover in config files
    '/server.ts', // Main server setup, often tested via integration tests
    '/index.ts', // Main entry point
  ],
};
