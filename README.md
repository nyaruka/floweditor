# Flow Editor

[![Build Status](https://github.com/nyaruka/floweditor/workflows/Build/badge.svg)](https://github.com/nyaruka/floweditor/actions?workflow=Build)
[![codecov](https://codecov.io/gh/nyaruka/floweditor/branch/master/graph/badge.svg)](https://codecov.io/gh/nyaruka/floweditor)

This is a standalone flow editing tool designed for use within the [RapidPro](https://github.com/rapidpro/rapidpro) suite of messaging tools but can be adopted for use outside of that ecosystem. The editor is a React component built with TypeScript and bundled with Webpack. It is open-sourced under the AGPL-3.0 license.

You can view and interact with the component [here](https://floweditor.nyaruka.com/).

### Prerequisites

```
yarn
Node.js >= 10.x
```

### Installation

The flow editor is a non-ejected project based on create-react-app. We use yarn to manage dependencies.

```
% yarn install
```

### Building

Webpack is used to transpile TypeScript and SASS. After invoking a build, the compiled results will arrive in `/build`.

```
% yarn run build
```

### Development

To run the flow editor in development mode, it requires an asset server. This is what is responsible for serving up flow definitions, groups, contact fields, etc. This project includes an in memory asset server for testing purposes. These are the same lambda functions used by our Netlify preview site.

First, compile and run the local version for a faux asset server.

```
% yarn lambda
```

Then you are ready to fire up the development server for the editor.

```bash
% yarn start
```

### Localization

The project is fully localized using `i18next` and leans on `react-i18next` to integrate it inside components. To generate new keys and defaults for localization, we use `i18next-scanner`. Use the yarn command `scan` to update localization keys.

```bash
% yarn scan
```

This file is then uploaded to Transifex for broad language translations. Once a language reaches full translation, it will be merged into the project.

### Running Tests

This project uses [Jest](https://facebook.github.io/jest/) for unit/snapshot testing and [react-testing-library](https://testing-library.com/docs/react-testing-library/intro) where we can. The project has some older more complex tests that use [Enzyme](https://github.com/airbnb/enzyme). Typescript and Jest are integrated via [ts-jest](https://github.com/kulshekhar/ts-jest).

```
% yarn test
```

Note that running this locally will automatically multithread based on how many cores your box has. It will also run it in the interactive watch mode. This mode is what you can use to easily run only failed tests or update snapshots. When this same command is run on CI, the tests will be run without watch mode automatically.

You can also run tests locally without watch mode

```
% yarn test --watchAll=false
```

### Formatting

[Prettier](https://github.com/prettier/prettier) is used to keep formatting consistent. We use huskey pre-commit hooks to run prettier on every commit.

It is possible to run prettify against the entire project without commits. This is only necessary if the project conventions change.

```
% yarn run prettify
```

### Publishing

To publish, simply invoke the desired semver -- patch, minor or major. This will version the package and travis will publish it to the npm repository automatically.

```
% yarn version --patch
% git push --tags
```

### Contributing

We encourage you to open issues on this project with any bugs you encounter or to make feature requests.
