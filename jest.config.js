module.exports = {
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
  moduleFileExtensions: [
    "js",
    "json",
    "ts",
    "tsx"
  ],
  rootDir: "./",
  testRegex: ".*\\.test\\.tsx?$",
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest"
  },
  collectCoverageFrom: [
    "<rootDir>/packages/**/*.(t|j)s"
  ],
  coverageDirectory: "../coverage",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@mini-react/(.*)$": "<rootDir>/packages/$1",
    "^@tests/(.*)$": "<rootDir>/tests/$1",
  }
};