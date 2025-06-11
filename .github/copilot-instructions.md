# Copilot Instructions for Flow Editor

## Project Overview

Flow Editor is a standalone React component for building conversational flows, designed for use within the [RapidPro](https://github.com/rapidpro/rapidpro) messaging platform. The editor is built with TypeScript, bundled with Webpack, and published as an npm package.

**Key Technologies:**
- React 16.8+ with TypeScript
- Create React App (non-ejected)
- Jest for testing with Enzyme and react-testing-library
- Prettier for code formatting
- Yarn for package management
- SASS for styling

## Development Setup

### Prerequisites
- Node.js >= 16.x
- Yarn package manager

### Installation
```bash
yarn install
```

## Building the Project

### Development Build
The project can be run in development mode, but requires an asset server (typically a RapidPro instance in EDITOR_DEV_MODE):
```bash
yarn start
```

### Production Build
**Important:** Due to Node.js version compatibility with older webpack versions, use the legacy OpenSSL provider:
```bash
NODE_OPTIONS="--openssl-legacy-provider" yarn build
```

The build outputs to the `/build` directory and creates optimized production bundles.

## Testing

### Running Tests
```bash
# Run tests in interactive watch mode (default for local development)
yarn test

# Run tests once without watch mode (for CI/validation)
yarn test --watchAll=false
```

**Test Details:**
- 556+ tests across 102+ test suites
- Uses Jest with TypeScript integration via ts-jest
- Combines Enzyme (older tests) and react-testing-library (newer tests)
- Includes snapshot testing for UI components
- Automatically runs in multi-threaded mode based on available CPU cores

### Test Configuration
- Tests are located alongside source files with `.test.ts` or `.test.tsx` extensions
- Test setup is in `src/testUtils/setup.ts`
- Configuration in `jest.config.js`

## Code Quality and Formatting

### Prettier Formatting
```bash
# Format all files
yarn run prettify

# Note: Prettier runs automatically on commit via husky pre-commit hooks
```

### Pre-commit Hooks
The project uses husky with lint-staged to automatically format code on commit.

## Project Structure

### Key Directories
- `src/` - Main source code
  - `components/` - React components organized by feature
  - `store/` - Redux store and state management
  - `utils/` - Utility functions
  - `testUtils/` - Testing utilities and setup
- `lambda/` - Netlify lambda functions, not currently used
- `public/` - Static assets
- `.github/` - GitHub workflows and templates

### Important Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `jest.config.js` - Test configuration
- `.prettierrc` - Prettier configuration

## Making Changes

### Development Workflow
1. **Install dependencies:** `yarn install`
2. **Run tests:** `yarn test --watchAll=false` to validate current state
3. **Make your changes** following existing patterns
4. **Format code:** `yarn run prettify` (or rely on pre-commit hooks)
5. **Test changes:** `yarn test --watchAll=false`
6. **Build:** `NODE_OPTIONS="--openssl-legacy-provider" yarn build`

### Best Practices
- Follow existing TypeScript patterns and component structure
- Write tests for new functionality using Jest and react-testing-library
- Use snapshot testing for UI components where appropriate
- Ensure all tests pass before submitting changes
- Let Prettier handle formatting automatically

### Component Testing
- Use `react-testing-library` for new tests when possible
- Existing complex tests may use Enzyme (maintain consistency)
- Create snapshot tests for UI components
- Test user interactions and component state changes

## Common Issues and Solutions

### Node.js Compatibility
**Issue:** Build fails with OpenSSL digital envelope routines error
**Solution:** Use the legacy OpenSSL provider:
```bash
NODE_OPTIONS="--openssl-legacy-provider" yarn build
```

### Test Watch Mode
**Issue:** Tests run in watch mode by default in local development
**Solution:** Use `--watchAll=false` for one-time test runs:
```bash
yarn test --watchAll=false
```

### Dependency Warnings
The project may show peer dependency warnings for ESLint packages. These are non-critical and don't affect functionality.

## Validation Checklist

Before submitting changes:
- [ ] `yarn install` completes successfully
- [ ] `yarn test --watchAll=false` passes all tests
- [ ] `NODE_OPTIONS="--openssl-legacy-provider" yarn build` completes successfully
- [ ] Code is properly formatted (pre-commit hooks handle this)
- [ ] New functionality includes appropriate tests
- [ ] No new TypeScript errors introduced

## Publishing

The project uses semantic versioning:
```bash
yarn version --patch  # for bug fixes
yarn version --minor  # for new features
yarn version --major  # for breaking changes
git push --tags
```

## Additional Resources

- [Create React App Documentation](https://create-react-app.dev/)
- [Jest Testing Framework](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
