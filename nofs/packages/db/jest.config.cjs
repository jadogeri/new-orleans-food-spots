/** @type {import('jest').Config} */
module.exports = {
  displayName: 'db',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['babel-jest', { configFile: './babel.config.cjs' }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.+)\\.js$': '$1',
  },
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/test-db.ts',
    '!src/clear-db.ts',
    '!src/migrations/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transformIgnorePatterns: ['node_modules/'],
};
