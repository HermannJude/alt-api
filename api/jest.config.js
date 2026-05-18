module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: {
          baseUrl: './',
          paths: {
            'src/*': ['src/*'],
            'generated/*': ['generated/*'],
          },
        },
      },
    ],
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^generated/(.*)$': '<rootDir>/generated/$1',
    '^(.+)\\.js$': '$1',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    'categories',
    'usage-metrics',
  ],
};
