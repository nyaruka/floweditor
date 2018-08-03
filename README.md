# FlowEditor
[![Build Status](https://travis-ci.org/nyaruka/floweditor.svg?branch=master)](https://travis-ci.org/nyaruka/floweditor)
[![codecov](https://codecov.io/gh/nyaruka/floweditor/branch/master/graph/badge.svg)](https://codecov.io/gh/nyaruka/floweditor)

This is a standalone flow editing tool designed for use within the [RapidPro](https://github.com/rapidpro/rapidpro) suite of messaging tools but can be adopted for use outside of that ecosystem. The editor is a React component built with TypeScript and bundled with Webpack. It is open-sourced under the AGPL-3.0 license.

You can view and interact with the component [here](https://floweditor.nyaruka.com/).

## Prerequisites

```bash
NPM
Node.js >= 6.x
```

## Installation

The flow editor uses npm for all dependencies.

```bash
% npm install
```

## Building

Webpack is used to transpile TypeScript and SASS. After invoking a build, the compiled results will arrive in `/preview/dist` for development or `/dist` for production.

```bash
% npm run build:prev
```

or

```bash
% npm run build:prod
```

## Development

You can run the editor in a development server whose content base includes the `/preview/src` and `/assets` directories. To start a development server, compile all necessary bits, and then launch your default browser with the results, run the command below. The resulting server will watch for changes to any TypeScript or SASS files and automatically recompile.

```bash
% npm run start:dev
```

### API Server

A small server exists in `/assets` to provide sample payloads defined in JSON to a version of the Flow Editor living at the hosting service of your choosing. You can choose to provide your own Sentry DSN and a valid `now.json` file, or remove them in favor of your own config. Use the `dev` NPM script in that directory to run the server in development.


### Configuration

This component is configured with the sample config at `/assets/config.js`. Universal information like `languages` and `endpoints` is made available throughout the component by `ConfigProvider`, which makes use of React's [context API](https://reactjs.org/docs/context.html).

### Styling

This project uses SASS (SCSS) to compose styles and [CSS Modules](https://github.com/css-modules/css-modules) to scope those styles to components. Typings for CSS Modules are generated on the fly by [typings-for-css-modules-loader](https://github.com/Jimdo/typings-for-css-modules-loader).

## Running Tests

This project uses [Jest](https://facebook.github.io/jest/) for unit/snapshot testing and [Enzyme](https://github.com/airbnb/enzyme) to test React components. Typescript and Jest are integrated via [ts-jest](https://github.com/kulshekhar/ts-jest).

```bash
% npm run test:local
```

### Linting

This project uses both [eslint](https://eslint.org/) (Node) & [tslint](https://github.com/palantir/tslint) (TypeScript) to enforce consistent style.

```bash
% npm run lint:es
% npm run lint:ts
```

### Formatting

[Prettier](https://github.com/prettier/prettier) is used to keep formatting consistent.

```bash
% npm run prettify
```

## Contributing

Please read [CONTRIBUTING.md](https://github.com/nyaruka/floweditor/blob/master/CONTRIBUTING.md) for details on this project's code of conduct, and the process for submitting pull requests to this repo.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see this repo's [tags](https://github.com/nyaruka/floweditor/tags).
