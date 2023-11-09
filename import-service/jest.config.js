module.exports = {
  preset: "ts-jest",
  verbose: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "node",
  testTimeout: 20000,
  testMatch: [
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  transform: {
    "^.+\\.(ts|tsx|js)$": "ts-jest",
  },
  moduleNameMapper: {
    "@libs(.*)": "<rootDir>/src/libs/$1",
    "@functions(.*)": "<rootDir>/src/functions/$1",
    "@mocks(.*)": "<rootDir>/src/mocks/$1",
  }
};