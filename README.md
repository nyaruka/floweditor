# Flow Editor
Here lies our new standalone flow editing tool for our new shiny flow format. The editor is built with React and Webpack.

## Installation
The flow editor uses npm for all dependencies.
```
% npm install
```

## Buildling
Webpack is used to transpile TypeScript and SASS. Afert invoking a build, the compiled results will arrive in the /dist folder.
```
% npm run build:dev
```
or
```
% npm run build:prod
```

## Development
You can run the editor in a development server. This start a development server, compile all necessary bits, and then launch your default browser with the results. The development server watches for changes to any TypeScript or SASS documents and automatically recompiles them. If you launch using this command, a websocket connection will also be opened which will auto-reload the browser after any code changes.
```
% npm start
```
