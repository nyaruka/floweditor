module.exports = {
    automock: false,
    verbose: false,
    snapshotSerializers: ['enzyme-to-json/serializer'],
    transform: {
        '.tsx?': '<rootDir>/node_modules/ts-jest/preprocessor.js'
    },
    roots: ['<rootDir>/src/', '<rootDir>/__test__/', '<rootDir>/__mocks__/'],
    testPathIgnorePatterns: ['/node_modules/', '/lib/'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(j|t)sx?$',
    modulePathIgnorePatterns: ['lib'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    moduleNameMapper: {
        '^.+\\.s?css$': 'identity-obj-proxy',
        '^~/test/(.*)$': '<rootDir>/__test__/$1',
        '^~/(.*)$': '<rootDir>/src/$1'
    },
    collectCoverageFrom: ['src/**/*.{ts,tsx}'],
    coverageReporters: ['lcov', 'json'],
    coveragePathIgnorePatterns: ['/*.d.ts$', 'lambda-src', 'webpack', 'testUtils', '__test__.ts'],
    setupTestFrameworkScriptFile: '<rootDir>/src/testUtils/setup.ts'
};
