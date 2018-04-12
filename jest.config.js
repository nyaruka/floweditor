module.exports = {
    verbose: true,
    snapshotSerializers: ['enzyme-to-json/serializer'],
    transform: {
        '.tsx?': '<rootDir>/node_modules/ts-jest/preprocessor.js'
    },
    testPathIgnorePatterns: ['/node_modules/'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(j|t)sx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    moduleNameMapper: {
        '^.+\\.s?css$': 'identity-obj-proxy'
    },
    collectCoverageFrom: ['src/**/*.{ts,tsx}'],
    coveragePathIgnorePatterns: ['/*.d.ts$', 'lambda-src', 'webpack', 'testUtils', '__test__.ts'],
    setupFiles: ['<rootDir>/setup.js']
};
