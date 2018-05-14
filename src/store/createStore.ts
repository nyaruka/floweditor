import { applyMiddleware, createStore, Middleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';

import rootReducer from './rootReducer';
import AppState, { initialState } from './state';

const middlewares: Middleware[] = [thunk];

/* istanbul ignore next */
if (process.env.DEBU === 'development') {
    const logger = createLogger({
        duration: true
    });
    middlewares.push(logger);
}

export default (state: AppState = initialState) => {
    const store = createStore(
        rootReducer,
        state,
        composeWithDevTools(applyMiddleware(...middlewares))
    );

    /* istanbul ignore next */
    if (module.hot) {
        module.hot.accept('./rootReducer', () => {
            const { default: nextRootReducer } = require('./rootReducer');
            store.replaceReducer(nextRootReducer);
        });
    }

    return store;
};
