module.exports = {
    automock: false,
    verbose: false,
    testURL: 'http://localhost/',
    snapshotSerializers: ['enzyme-to-json/serializer'],
    transform: {
        '.tsx?': 'ts-jest',
        '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub'
    },
    roots: ['<rootDir>/src/', '<rootDir>/__test__/', '<rootDir>/__mocks__/'],
    testPathIgnorePatterns: ['/node_modules/', '/lib/'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(j|t)sx?$',
    modulePathIgnorePatterns: ['lib'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    moduleNameMapper: {
        '^.+\\.s?css$': 'identity-obj-proxy',
        '^~/test/(.*)$': '<rootDir>/__test__/$1',
        '^~/(.*)$': '<rootDir>/src/$1',
        '^static/(.*)$': '<rootDir>/static/$1',
        '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'identity-obj-proxy'
    },
    collectCoverageFrom: ['src/**/*.{ts,tsx}'],
    coverageReporters: ['lcov', 'json'],
    coveragePathIgnorePatterns: ['/*.d.ts$', 'lambda-src', 'webpack', 'testUtils', '__test__.ts'],
    setupFilesAfterEnv: ['<rootDir>/src/testUtils/setup.ts']
};
