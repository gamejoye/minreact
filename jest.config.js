module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest/jest.setup.ts'],
  moduleFileExtensions: [
    "js",
    "json",
    "ts",
    "tsx"
  ],
  rootDir: "packages",
  testRegex: ".*\\.test\\.tsx?$",
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest"
  },
  collectCoverageFrom: [
    "**/*.(t|j)s"
  ],
  coverageDirectory: "../coverage",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@mini-react/(.*)$": "<rootDir>/$1"
  }
};