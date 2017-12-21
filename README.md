[![Build Status](https://travis-ci.org/nyaruka/floweditor.svg?branch=master)](https://travis-ci.org/nyaruka/floweditor)
[![Coverage Status](https://coveralls.io/repos/github/nyaruka/floweditor/badge.svg?branch=master)](https://coveralls.io/github/nyaruka/floweditor?branch=master)

# Flow Editor
This is a standalone flow editing tool designed for use within the [RapidPro](https://github.com/rapidpro/rapidpro)
 suite of messaging tools but can be adopted for use outside of that ecosystem. The editor is a React component built with TypeScript and bundled with Webpack. It is open-sourced under the AGPL-3.0 license.


### Prerequisites
```
NPM
Node.js >= 6.x
```

## Installation
The flow editor uses npm for all dependencies.
```
% npm install
```

## Buildling
Webpack is used to transpile TypeScript and SASS. After invoking a build, the compiled results will arrive in the /dist folder.
```
% npm run build:dev
```
or
```
% npm run build:prod
```

## Development
You can run the editor in a development server. To start a development server, compile all necessary bits, and then launch your default browser with the results. The development server watches for changes to any TypeScript or SASS documents and automatically recompiles them.
```
% npm start
```

### Hot Reloading
This project uses [React Hot Loader](https://github.com/gaearon/react-hot-loader) to keep components mounted/preserve their state while in development.

### Configuration

This project is currently configured via `flowEditor.config.*.js` in the root directory, which is loaded into the bundle as an [external](https://webpack.js.org/configuration/externals/), `Config`, via Webpack. The `ConfigProvider` component composes the app's configuration and provides it to each component via React's [context API](https://reactjs.org/docs/context.html).

### Styling

This project uses SASS (SCSS) to compose styles and [CSS Modules](https://github.com/css-modules/css-modules) to scope those styles to components. Typings for CSS Modules are generated on the fly by [typings-for-css-modules-loader](https://github.com/Jimdo/typings-for-css-modules-loader). 

## Running Tests

This project uses [Jest](https://facebook.github.io/jest/) for unit/snapshot testing and [Enzyme](https://github.com/airbnb/enzyme) to test React components. Typescript and Jest are integrated via [ts-jest](https://github.com/kulshekhar/ts-jest).

```
% npm run test:local
```
### Linting

This project uses both [eslint](https://eslint.org/) (Node) & [tslint](https://github.com/palantir/tslint) (TypeScript) to enforce consistent style.

```
% npm run lint:es
% npm run lint:ts
```

### Formatting

[Prettier](https://github.com/prettier/prettier) is used to keep formatting consistent.

```
% npm run prettify
```

## Contributing

Please read [CONTRIBUTING.md](https://github.com/nyaruka/floweditor/blob/master/CONTRIBUTING.md) for details on this project's code of conduct, and the process for submitting pull requests to this repo.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see this repo's [tags](https://github.com/nyaruka/floweditor/tags).

