[![Build Status](https://travis-ci.org/nyaruka/floweditor.svg?branch=master)](https://travis-ci.org/nyaruka/floweditor) [![Coverage Status](https://coveralls.io/repos/github/nyaruka/floweditor/badge.svg?branch=jest-in-time)](https://coveralls.io/github/nyaruka/floweditor?branch=jest-in-time)
# Flow Editor
This is a standalone flow editing tool designed for use within the [RapidPro](https://github.com/rapidpro/rapidpro)
 suite of messaging tools but can be adopted for use outside of that ecosystem. The editor is a React component built with TypeScript and bundled with Webpack. It is open-sourced under the AGPL-3.0 license.

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
You can run the editor in a development server. To start a development server, compile all necessary bits, and then launch your default browser with the results. The development server watches for changes to any TypeScript or SASS documents and automatically recompiles them. If you launch using this command, a websocket connection will also be opened which will auto-reload the browser after any code changes.
```
% npm start
```
